from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class AuditLog(models.Model):
    """Audit log for tracking user actions."""
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    action = models.CharField(max_length=255)
    target = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='targeted_audit_logs')
    target_type = models.CharField(max_length=100, blank=True, null=True)
    target_name = models.CharField(max_length=255, blank=True, null=True)
    details = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'audit_logs'
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.action} by {self.actor.username if self.actor else 'Unknown'} at {self.timestamp}"


class PlatformSettings(models.Model):
    """Platform settings stored as JSON."""
    settings = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_settings')
    
    class Meta:
        db_table = 'platform_settings'
        verbose_name_plural = 'Platform Settings'
    
    def __str__(self):
        return "Platform Settings"
    
    def save(self, *args, **kwargs):
        """Ensure only one instance exists."""
        self.pk = 1
        super().save(*args, **kwargs)
    
    @classmethod
    def get_settings(cls):
        """Get or create platform settings."""
        obj, created = cls.objects.get_or_create(pk=1, defaults={'settings': {}})
        return obj

