from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import DoctorProfile
from .serializers import DoctorSerializer, DoctorListSerializer


class DoctorViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for DoctorProfile (read-only)."""
    queryset = DoctorProfile.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [permissions.AllowAny]  # Anyone can view doctors
    
    def get_serializer_class(self):
        """Use different serializer for list vs detail."""
        if self.action == 'list':
            return DoctorListSerializer
        return DoctorSerializer
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def availability(self, request, pk=None):
        """Get doctor availability."""
        doctor = self.get_object()
        return Response({
            'availability': doctor.availability
        })
