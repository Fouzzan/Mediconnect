from django.db import models
from django.contrib.auth import get_user_model
import json

User = get_user_model()


class PatientProfile(models.Model):
    """Patient profile linked to User."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'patient_profiles'
    
    def __str__(self):
        return f"Patient Profile: {self.user.username}"


class HealthInfo(models.Model):
    """Health information for a patient."""
    patient = models.OneToOneField(PatientProfile, on_delete=models.CASCADE, related_name='health_info')
    date_of_birth = models.DateField(null=True, blank=True)
    blood_type = models.CharField(max_length=10, blank=True, default='')
    allergies = models.JSONField(default=list, blank=True)
    chronic_conditions = models.JSONField(default=list, blank=True)
    medications = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'health_info'
    
    def __str__(self):
        return f"Health Info: {self.patient.user.username}"


class VitalSign(models.Model):
    """Vital signs record."""
    health_info = models.ForeignKey(HealthInfo, on_delete=models.CASCADE, related_name='vitals')
    date = models.DateField()
    blood_pressure = models.CharField(max_length=20, blank=True)
    heart_rate = models.IntegerField(null=True, blank=True)
    bmi = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'vital_signs'
        ordering = ['-date']
    
    def __str__(self):
        return f"Vital Sign: {self.date}"


class SleepLog(models.Model):
    """Sleep log entry."""
    QUALITY_CHOICES = [
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
    ]
    
    health_info = models.ForeignKey(HealthInfo, on_delete=models.CASCADE, related_name='sleep_logs')
    date = models.DateField()
    duration = models.CharField(max_length=20, blank=True)
    quality = models.CharField(max_length=10, choices=QUALITY_CHOICES, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'sleep_logs'
        ordering = ['-date']
    
    def __str__(self):
        return f"Sleep Log: {self.date}"


class HeartRateLog(models.Model):
    """Heart rate log entry."""
    health_info = models.ForeignKey(HealthInfo, on_delete=models.CASCADE, related_name='heart_rate_logs')
    date = models.DateField()
    time = models.TimeField()
    rate = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'heart_rate_logs'
        ordering = ['-date', '-time']
    
    def __str__(self):
        return f"Heart Rate: {self.date} {self.time}"


class BloodPressureLog(models.Model):
    """Blood pressure log entry."""
    health_info = models.ForeignKey(HealthInfo, on_delete=models.CASCADE, related_name='blood_pressure_logs')
    date = models.DateField()
    time = models.TimeField()
    systolic = models.IntegerField()
    diastolic = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'blood_pressure_logs'
        ordering = ['-date', '-time']
    
    def __str__(self):
        return f"Blood Pressure: {self.date} {self.time}"


class BloodOxygenLog(models.Model):
    """Blood oxygen log entry."""
    health_info = models.ForeignKey(HealthInfo, on_delete=models.CASCADE, related_name='blood_oxygen_logs')
    date = models.DateField()
    time = models.TimeField()
    level = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'blood_oxygen_logs'
        ordering = ['-date', '-time']
    
    def __str__(self):
        return f"Blood Oxygen: {self.date} {self.time}"


class HealthDocument(models.Model):
    """Health document upload."""
    health_info = models.ForeignKey(HealthInfo, on_delete=models.CASCADE, related_name='health_documents')
    name = models.CharField(max_length=255)
    document_type = models.CharField(max_length=100, blank=True)
    file = models.FileField(upload_to='health_documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'health_documents'
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"Document: {self.name}"


class ClinicalNote(models.Model):
    """Clinical note entry."""
    NOTE_TYPE_CHOICES = [
        ('general', 'General'),
        ('soap', 'SOAP'),
    ]
    
    health_info = models.ForeignKey(HealthInfo, on_delete=models.CASCADE, related_name='clinical_notes')
    date = models.DateTimeField()
    note_type = models.CharField(max_length=20, choices=NOTE_TYPE_CHOICES, default='general')
    content = models.JSONField()  # Can be string or SOAP structure
    clinician = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='clinical_notes')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'clinical_notes'
        ordering = ['-date']
    
    def __str__(self):
        return f"Clinical Note: {self.date}"
