from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import (
    PatientProfile, HealthInfo, VitalSign, SleepLog,
    HeartRateLog, BloodPressureLog, BloodOxygenLog,
    HealthDocument, ClinicalNote
)
from .serializers import (
    PatientProfileSerializer, HealthInfoSerializer, VitalSignSerializer,
    SleepLogSerializer, HeartRateLogSerializer, BloodPressureLogSerializer,
    BloodOxygenLogSerializer, HealthDocumentSerializer, ClinicalNoteSerializer
)

User = get_user_model()


class PatientProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for PatientProfile."""
    queryset = PatientProfile.objects.all()
    serializer_class = PatientProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter queryset based on user role."""
        user = self.request.user
        
        if user.role == 'admin':
            return PatientProfile.objects.all()
        elif user.role == 'clinician':
            # Clinicians can see all patients
            return PatientProfile.objects.all()
        else:
            # Patients can only see themselves
            return PatientProfile.objects.filter(user=user)
    
    def get_or_create_patient_profile(self, user):
        """Get or create patient profile for user."""
        profile, created = PatientProfile.objects.get_or_create(user=user)
        return profile
    
    def get_or_create_health_info(self, patient_profile):
        """Get or create health info for patient."""
        health_info, created = HealthInfo.objects.get_or_create(patient=patient_profile)
        return health_info
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Get current user's patient profile."""
        if request.user.role != 'patient':
            return Response(
                {'error': 'User is not a patient'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        profile = self.get_or_create_patient_profile(request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get', 'put', 'patch'], permission_classes=[permissions.IsAuthenticated])
    def health_info(self, request, pk=None):
        """Get or update health info for a patient."""
        profile = self.get_object()
        health_info = self.get_or_create_health_info(profile)
        
        if request.method == 'GET':
            serializer = HealthInfoSerializer(health_info)
            return Response(serializer.data)
        
        elif request.method in ['PUT', 'PATCH']:
            # Check permissions
            if request.user.role not in ['admin', 'clinician'] and request.user != profile.user:
                return Response(
                    {'error': 'Permission denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = HealthInfoSerializer(health_info, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def vitals(self, request, pk=None):
        """Add vital sign."""
        profile = self.get_object()
        health_info = self.get_or_create_health_info(profile)
        
        serializer = VitalSignSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(health_info=health_info)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def sleep_logs(self, request, pk=None):
        """Add sleep log."""
        profile = self.get_object()
        health_info = self.get_or_create_health_info(profile)
        
        serializer = SleepLogSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(health_info=health_info)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def heart_rate_logs(self, request, pk=None):
        """Add heart rate log."""
        profile = self.get_object()
        health_info = self.get_or_create_health_info(profile)
        
        serializer = HeartRateLogSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(health_info=health_info)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def blood_pressure_logs(self, request, pk=None):
        """Add blood pressure log."""
        profile = self.get_object()
        health_info = self.get_or_create_health_info(profile)
        
        serializer = BloodPressureLogSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(health_info=health_info)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def blood_oxygen_logs(self, request, pk=None):
        """Add blood oxygen log."""
        profile = self.get_object()
        health_info = self.get_or_create_health_info(profile)
        
        serializer = BloodOxygenLogSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(health_info=health_info)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def health_documents(self, request, pk=None):
        """Upload health document."""
        profile = self.get_object()
        health_info = self.get_or_create_health_info(profile)
        
        serializer = HealthDocumentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(health_info=health_info)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def clinical_notes(self, request, pk=None):
        """Add clinical note."""
        profile = self.get_object()
        health_info = self.get_or_create_health_info(profile)
        
        # Only clinicians and admins can add clinical notes
        if request.user.role not in ['clinician', 'admin']:
            return Response(
                {'error': 'Only clinicians and admins can add clinical notes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ClinicalNoteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(health_info=health_info, clinician=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
