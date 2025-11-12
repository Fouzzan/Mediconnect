from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Appointment
from .serializers import AppointmentSerializer, AppointmentCreateSerializer

User = get_user_model()


class AppointmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Appointment."""
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        """Use different serializer for create vs other actions."""
        if self.action == 'create':
            return AppointmentCreateSerializer
        return AppointmentSerializer
    
    def get_queryset(self):
        """Filter queryset based on user role."""
        user = self.request.user
        
        if user.role == 'admin':
            return Appointment.objects.all()
        elif user.role == 'clinician':
            # Clinicians see their own appointments
            return Appointment.objects.filter(doctor=user)
        else:
            # Patients see their own appointments
            return Appointment.objects.filter(patient=user)
    
    def create(self, request, *args, **kwargs):
        """Create a new appointment."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Set patient to current user if not admin
        if request.user.role != 'admin':
            serializer.validated_data['patient'] = request.user
        
        appointment = serializer.save()
        
        # Return with full serializer
        response_serializer = AppointmentSerializer(appointment)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def patient(self, request, pk=None):
        """Get appointments for a specific patient."""
        patient_id = request.query_params.get('id') or request.query_params.get('patient_id')
        
        if not patient_id:
            return Response(
                {'error': 'Patient ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check permissions
        user = request.user
        if user.role not in ['admin', 'clinician'] and str(user.id) != str(patient_id):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            patient = User.objects.get(id=patient_id, role='patient')
        except User.DoesNotExist:
            return Response(
                {'error': 'Patient not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        appointments = Appointment.objects.filter(patient=patient).order_by('-date', '-time')
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def clinician(self, request, pk=None):
        """Get appointments for a specific clinician."""
        clinician_id = request.query_params.get('id') or request.query_params.get('clinician_id')
        
        if not clinician_id:
            return Response(
                {'error': 'Clinician ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check permissions
        user = request.user
        if user.role not in ['admin', 'clinician'] and str(user.id) != str(clinician_id):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            clinician = User.objects.get(id=clinician_id, role='clinician')
        except User.DoesNotExist:
            return Response(
                {'error': 'Clinician not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        appointments = Appointment.objects.filter(doctor=clinician).order_by('-date', '-time')
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)
