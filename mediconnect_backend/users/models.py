from django.contrib.auth.models import AbstractUser
from django.db import models
import json


class User(AbstractUser):
    """Custom User model with role, face ID, and status fields."""
    
    ROLE_CHOICES = [
        ('patient', 'Patient'),
        ('clinician', 'Clinician'),
        ('admin', 'Admin'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('suspended', 'Suspended'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, null=True, blank=True)
    face_id_enabled = models.BooleanField(default=False)
    face_encoding = models.TextField(null=True, blank=True, help_text="JSON-encoded face encoding")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    
    # Caregiver relationships
    caregivers = models.ManyToManyField(
        'self',
        symmetrical=False,
        related_name='caring_for',
        blank=True,
        help_text="Users who can access this patient's account"
    )
    
    class Meta:
        db_table = 'users'
    
    def __str__(self):
        return self.username
    
    def get_face_encoding(self):
        """Get face encoding as a list."""
        if self.face_encoding:
            try:
                return json.loads(self.face_encoding)
            except json.JSONDecodeError:
                return None
        return None
    
    def set_face_encoding(self, encoding):
        """Set face encoding from a list."""
        if encoding:
            self.face_encoding = json.dumps(encoding)
        else:
            self.face_encoding = None

