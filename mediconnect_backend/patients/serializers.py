from rest_framework import serializers
from .models import (
    PatientProfile, HealthInfo, VitalSign, SleepLog,
    HeartRateLog, BloodPressureLog, BloodOxygenLog,
    HealthDocument, ClinicalNote
)
from users.serializers import UserSerializer


class VitalSignSerializer(serializers.ModelSerializer):
    """Serializer for VitalSign."""
    class Meta:
        model = VitalSign
        fields = ['date', 'bloodPressure', 'heartRate', 'bmi']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['bloodPressure'] = instance.blood_pressure
        data['heartRate'] = instance.heart_rate
        return data
    
    def to_internal_value(self, data):
        if 'bloodPressure' in data:
            data['blood_pressure'] = data.pop('bloodPressure')
        if 'heartRate' in data:
            data['heart_rate'] = data.pop('heartRate')
        return super().to_internal_value(data)


class SleepLogSerializer(serializers.ModelSerializer):
    """Serializer for SleepLog."""
    class Meta:
        model = SleepLog
        fields = ['date', 'duration', 'quality']


class HeartRateLogSerializer(serializers.ModelSerializer):
    """Serializer for HeartRateLog."""
    time = serializers.TimeField(format='%I:%M %p', input_formats=['%I:%M %p', '%H:%M:%S', '%H:%M'])
    
    class Meta:
        model = HeartRateLog
        fields = ['date', 'time', 'rate']


class BloodPressureLogSerializer(serializers.ModelSerializer):
    """Serializer for BloodPressureLog."""
    time = serializers.TimeField(format='%I:%M %p', input_formats=['%I:%M %p', '%H:%M:%S', '%H:%M'])
    
    class Meta:
        model = BloodPressureLog
        fields = ['date', 'time', 'systolic', 'diastolic']


class BloodOxygenLogSerializer(serializers.ModelSerializer):
    """Serializer for BloodOxygenLog."""
    time = serializers.TimeField(format='%I:%M %p', input_formats=['%I:%M %p', '%H:%M:%S', '%H:%M'])
    
    class Meta:
        model = BloodOxygenLog
        fields = ['date', 'time', 'level']


class HealthDocumentSerializer(serializers.ModelSerializer):
    """Serializer for HealthDocument."""
    id = serializers.CharField(read_only=True)
    name = serializers.CharField(read_only=True)
    type = serializers.CharField(source='document_type', read_only=True)
    uploadedAt = serializers.DateTimeField(source='uploaded_at', read_only=True)
    url = serializers.SerializerMethodField()
    
    class Meta:
        model = HealthDocument
        fields = ['id', 'name', 'type', 'uploadedAt', 'url']
    
    def get_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class ClinicalNoteSerializer(serializers.ModelSerializer):
    """Serializer for ClinicalNote."""
    id = serializers.CharField(read_only=True)
    clinician = serializers.CharField(source='clinician.username', read_only=True)
    
    class Meta:
        model = ClinicalNote
        fields = ['id', 'date', 'type', 'content', 'clinician']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['type'] = instance.note_type
        return data


class HealthInfoSerializer(serializers.ModelSerializer):
    """Serializer for HealthInfo."""
    vitals = VitalSignSerializer(many=True, read_only=True)
    sleepLogs = SleepLogSerializer(many=True, read_only=True, source='sleep_logs')
    heartRateLogs = HeartRateLogSerializer(many=True, read_only=True, source='heart_rate_logs')
    bloodPressureLogs = BloodPressureLogSerializer(many=True, read_only=True, source='blood_pressure_logs')
    bloodOxygenLogs = BloodOxygenLogSerializer(many=True, read_only=True, source='blood_oxygen_logs')
    healthDocuments = HealthDocumentSerializer(many=True, read_only=True, source='health_documents')
    clinicalNotes = ClinicalNoteSerializer(many=True, read_only=True, source='clinical_notes')
    
    class Meta:
        model = HealthInfo
        fields = [
            'dateOfBirth', 'bloodType', 'allergies', 'chronicConditions',
            'medications', 'vitals', 'sleepLogs', 'heartRateLogs',
            'bloodPressureLogs', 'bloodOxygenLogs', 'healthDocuments',
            'clinicalNotes'
        ]
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['dateOfBirth'] = instance.date_of_birth.strftime('%Y-%m-%d') if instance.date_of_birth else None
        data['bloodType'] = instance.blood_type
        return data
    
    def to_internal_value(self, data):
        if 'dateOfBirth' in data:
            data['date_of_birth'] = data.pop('dateOfBirth')
        if 'bloodType' in data:
            data['blood_type'] = data.pop('bloodType')
        if 'chronicConditions' in data:
            data['chronic_conditions'] = data.pop('chronicConditions')
        return super().to_internal_value(data)


class PatientProfileSerializer(serializers.ModelSerializer):
    """Serializer for PatientProfile."""
    user = UserSerializer(read_only=True)
    healthInfo = HealthInfoSerializer(source='health_info', read_only=True)
    
    class Meta:
        model = PatientProfile
        fields = ['user', 'healthInfo']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['healthInfo'] = HealthInfoSerializer(instance.health_info).data if hasattr(instance, 'health_info') else None
        return data
