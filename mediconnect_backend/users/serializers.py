from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class CaregiverInfoSerializer(serializers.Serializer):
    """Serializer for caregiver information."""
    userId = serializers.CharField(source='id', read_only=True)
    username = serializers.CharField(read_only=True)


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    id = serializers.CharField(read_only=True)
    caregivers = CaregiverInfoSerializer(many=True, read_only=True)
    caringFor = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'faceIdEnabled', 
            'status', 'lastLogin', 'caregivers', 'caringFor'
        ]
        read_only_fields = ['id', 'username', 'email', 'lastLogin']
    
    def get_caringFor(self, obj):
        """Get list of patients this user is caring for."""
        caring_for = obj.caring_for.all()
        return [{'userId': str(u.id), 'username': u.username} for u in caring_for]
    
    def to_representation(self, instance):
        """Convert to frontend format."""
        data = super().to_representation(instance)
        data['faceIdEnabled'] = instance.face_id_enabled
        data['lastLogin'] = instance.last_login.isoformat() if instance.last_login else None
        return data


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, min_length=6)
    faceImage = serializers.CharField(required=False, allow_null=True, write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'faceImage']
    
    def create(self, validated_data):
        """Create a new user."""
        face_image = validated_data.pop('faceImage', None)
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password
        )
        
        # Handle face ID if provided
        if face_image:
            # Face encoding will be set by the view using DeepFace
            user.face_id_enabled = True
        
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class FaceLoginSerializer(serializers.Serializer):
    """Serializer for face ID login."""
    username = serializers.CharField()
    faceImage = serializers.CharField()

