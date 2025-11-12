from rest_framework import status, permissions, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import AuditLog, PlatformSettings
from .utils import decode_base64_image, encode_face, verify_face
import json

User = get_user_model()


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def face_register(request):
    """Register user with Face ID."""
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    face_image = request.data.get('faceImage')
    
    if not all([username, email, password, face_image]):
        return Response(
            {'error': 'Missing required fields'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if user already exists
    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'User with this username already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'User with this email already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Decode and encode face
        image = decode_base64_image(face_image)
        face_encoding = encode_face(image)
        
        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            face_id_enabled=True
        )
        
        # Store face encoding
        user.set_face_encoding(face_encoding)
        user.last_login = timezone.now()
        user.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        from users.serializers import UserSerializer
        user_serializer = UserSerializer(user)
        
        return Response({
            'user': user_serializer.data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
        
    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Registration failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def face_login(request):
    """Login with Face ID."""
    username = request.data.get('username')
    face_image = request.data.get('faceImage')
    
    if not all([username, face_image]):
        return Response(
            {'error': 'Missing username or face image'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response(
            {'error': 'Face ID verification failed.'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if user.status == 'suspended':
        return Response(
            {'error': 'Your account has been suspended.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if not user.face_id_enabled:
        return Response(
            {'error': 'Face ID is not enabled for this user.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not user.face_encoding:
        return Response(
            {'error': 'Face ID is not enabled for this user.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Decode and verify face
        image = decode_base64_image(face_image)
        stored_encoding = user.get_face_encoding()
        
        if not stored_encoding:
            return Response(
                {'error': 'Face ID is not enabled for this user.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        is_verified = verify_face(image, stored_encoding)
        
        if not is_verified:
            return Response(
                {'error': 'Face ID verification failed.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Update last login
        user.last_login = timezone.now()
        user.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        from users.serializers import UserSerializer
        user_serializer = UserSerializer(user)
        
        return Response({
            'user': user_serializer.data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })
        
    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Face ID verification failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def token_refresh(request):
    """Refresh JWT token."""
    refresh_token = request.data.get('refresh')
    
    if not refresh_token:
        return Response(
            {'error': 'Refresh token is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        refresh = RefreshToken(refresh_token)
        access_token = refresh.access_token
        
        return Response({
            'access': str(access_token),
            'refresh': str(refresh),
        })
    except Exception as e:
        return Response(
            {'error': 'Invalid refresh token'},
            status=status.HTTP_401_UNAUTHORIZED
        )


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for AuditLog (admin only)."""
    queryset = AuditLog.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Only admins can view audit logs."""
        user = self.request.user
        if user.role != 'admin':
            return AuditLog.objects.none()
        return AuditLog.objects.all()
    
    def list(self, request, *args, **kwargs):
        """List audit logs."""
        if request.user.role != 'admin':
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        logs = self.get_queryset()
        serializer = self.get_serializer(logs, many=True)
        
        # Format response to match frontend expectations
        formatted_logs = []
        for log in logs:
            formatted_logs.append({
                'id': str(log.id),
                'timestamp': log.timestamp.isoformat(),
                'actor': {
                    'id': str(log.actor.id) if log.actor else None,
                    'name': log.actor.username if log.actor else 'Unknown'
                },
                'action': log.action,
                'target': {
                    'id': str(log.target.id) if log.target else None,
                    'type': log.target_type or '',
                    'name': log.target_name or (log.target.username if log.target else '')
                } if log.target or log.target_type else None,
                'details': log.details
            })
        
        return Response(formatted_logs)


class PlatformSettingsViewSet(viewsets.ModelViewSet):
    """ViewSet for PlatformSettings (admin only)."""
    queryset = PlatformSettings.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Only admins can view/edit settings."""
        user = self.request.user
        if user.role != 'admin':
            return PlatformSettings.objects.none()
        return PlatformSettings.objects.all()
    
    def list(self, request, *args, **kwargs):
        """Get platform settings."""
        if request.user.role != 'admin':
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        settings_obj = PlatformSettings.get_settings()
        return Response(settings_obj.settings)
    
    def update(self, request, *args, **kwargs):
        """Update platform settings."""
        if request.user.role != 'admin':
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        settings_obj = PlatformSettings.get_settings()
        settings_obj.settings = request.data
        settings_obj.updated_by = request.user
        settings_obj.save()
        
        return Response(settings_obj.settings)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def admin_users(request):
    """Admin user management."""
    if request.user.role != 'admin':
        return Response(
            {'error': 'Permission denied'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if request.method == 'GET':
        from users.serializers import UserSerializer
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        user_id = request.data.get('id')
        if not user_id:
            return Response(
                {'error': 'User ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Update user fields
        if 'role' in request.data:
            user.role = request.data['role']
        if 'status' in request.data:
            user.status = request.data['status']
        
        user.save()
        
        from users.serializers import UserSerializer
        serializer = UserSerializer(user)
        return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def admin_delete_user(request, user_id):
    """Delete a user (admin only)."""
    if request.user.role != 'admin':
        return Response(
            {'error': 'Permission denied'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        user = User.objects.get(id=user_id)
        user.delete()
        return Response({'success': True})
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )

