from rest_framework import serializers
from .models import DoctorProfile
from users.serializers import UserSerializer


class DoctorSerializer(serializers.ModelSerializer):
    """Serializer for DoctorProfile."""
    id = serializers.CharField(source='user.id', read_only=True)
    name = serializers.CharField(read_only=True)
    specialization = serializers.CharField(read_only=True)
    avatarUrl = serializers.URLField(source='avatar_url', read_only=True)
    availability = serializers.JSONField(read_only=True)
    
    class Meta:
        model = DoctorProfile
        fields = ['id', 'name', 'specialization', 'avatarUrl', 'availability']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['avatarUrl'] = instance.avatar_url or ''
        return data


class DoctorListSerializer(serializers.ModelSerializer):
    """Serializer for listing doctors."""
    id = serializers.CharField(source='user.id', read_only=True)
    name = serializers.CharField(read_only=True)
    specialization = serializers.CharField(read_only=True)
    avatarUrl = serializers.URLField(source='avatar_url', read_only=True)
    availability = serializers.JSONField(read_only=True)
    
    class Meta:
        model = DoctorProfile
        fields = ['id', 'name', 'specialization', 'avatarUrl', 'availability']
