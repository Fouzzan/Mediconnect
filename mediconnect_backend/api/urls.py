from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    face_register, face_login, token_refresh,
    AuditLogViewSet, PlatformSettingsViewSet,
    admin_users, admin_delete_user
)

router = DefaultRouter()
router.register(r'admin/audit-logs', AuditLogViewSet, basename='audit-log')
router.register(r'admin/settings', PlatformSettingsViewSet, basename='platform-settings')

urlpatterns = [
    path('auth/register/', face_register, name='face-register'),
    path('auth/face-login/', face_login, name='face-login'),
    path('auth/refresh/', token_refresh, name='token-refresh'),
    path('admin/users/', admin_users, name='admin-users'),
    path('admin/users/<str:user_id>/', admin_delete_user, name='admin-delete-user'),
    path('', include(router.urls)),
]

