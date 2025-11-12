from django.db import models
from django.contrib.auth import get_user_model
import json

User = get_user_model()


class DoctorProfile(models.Model):
    """Doctor profile linked to User."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    name = models.CharField(max_length=255)
    specialization = models.CharField(max_length=255)
    avatar_url = models.URLField(blank=True, null=True)
    availability = models.JSONField(default=list, blank=True, help_text="List of available days")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'doctor_profiles'
    
    def __str__(self):
        return f"Dr. {self.name} - {self.specialization}"
