from rest_framework import serializers
from .models import Appointment
from users.serializers import UserSerializer
from doctors.serializers import DoctorSerializer


class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer for Appointment."""
    id = serializers.CharField(read_only=True)
    userId = serializers.CharField(source='patient.id', read_only=True)
    doctorId = serializers.CharField(source='doctor.id', read_only=True)
    doctor = serializers.SerializerMethodField()
    patient = serializers.SerializerMethodField()
    date = serializers.DateField(format='%Y-%m-%d')
    time = serializers.TimeField(format='%I:%M %p', input_formats=['%I:%M %p', '%H:%M:%S', '%H:%M'])
    type = serializers.CharField(source='appointment_type', read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'userId', 'doctorId', 'doctor', 'patient',
            'date', 'time', 'status', 'reason', 'type'
        ]
        read_only_fields = ['id', 'userId', 'doctorId']
    
    def get_doctor(self, obj):
        """Get doctor information."""
        if hasattr(obj.doctor, 'doctor_profile'):
            doctor_profile = obj.doctor.doctor_profile
            return {
                'id': str(obj.doctor.id),
                'name': doctor_profile.name,
                'specialization': doctor_profile.specialization,
                'avatarUrl': doctor_profile.avatar_url or '',
                'availability': doctor_profile.availability
            }
        return None
    
    def get_patient(self, obj):
        """Get patient information."""
        return {'username': obj.patient.username}
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['type'] = instance.appointment_type
        return data


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating appointments."""
    userId = serializers.CharField(source='patient', write_only=True)
    doctorId = serializers.CharField(source='doctor', write_only=True)
    date = serializers.DateField(format='%Y-%m-%d', input_formats=['%Y-%m-%d'])
    time = serializers.TimeField(format='%I:%M %p', input_formats=['%I:%M %p', '%H:%M:%S', '%H:%M'])
    type = serializers.CharField(source='appointment_type', required=False)
    
    class Meta:
        model = Appointment
        fields = ['userId', 'doctorId', 'date', 'time', 'reason', 'type']
    
    def create(self, validated_data):
        """Create appointment."""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        patient_id = validated_data.pop('patient')
        doctor_id = validated_data.pop('doctor')
        
        patient = User.objects.get(id=patient_id)
        doctor = User.objects.get(id=doctor_id)
        
        appointment = Appointment.objects.create(
            patient=patient,
            doctor=doctor,
            **validated_data
        )
        return appointment
    
    def to_internal_value(self, data):
        if 'userId' in data:
            data['patient'] = data.pop('userId')
        if 'doctorId' in data:
            data['doctor'] = data.pop('doctorId')
        if 'type' in data:
            data['appointment_type'] = data.pop('type')
        return super().to_internal_value(data)
