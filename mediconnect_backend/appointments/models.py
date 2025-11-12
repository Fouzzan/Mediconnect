from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Appointment(models.Model):
    """Appointment model."""
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    TYPE_CHOICES = [
        ('follow-up', 'Follow-up'),
        ('annual-checkup', 'Annual Checkup'),
        ('consultation', 'Consultation'),
    ]
    
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='patient_appointments')
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='doctor_appointments')
    date = models.DateField()
    time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    reason = models.TextField(blank=True)
    appointment_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='consultation')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'appointments'
        ordering = ['-date', '-time']
    
    def __str__(self):
        return f"Appointment: {self.patient.username} with Dr. {self.doctor.username} on {self.date}"
