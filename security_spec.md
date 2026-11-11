# Security Specification for I+D+i Pastelería

## 1. Data Invariants
- Each entity must have a valid document ID conforming to regex `^[a-zA-Z0-9_\\-]+$` under 128 chars.
- All documents require authentication with a verified email (`request.auth != null && request.auth.token.email_verified == true`).
- Input strings are bounded to prevent Denial of Wallet attacks.
- Solicitudes, Proyectos, Pruebas, RegistrosHoras, Documentos, Empleados, and Auditoria have strict validation rules.

## 2. Dirty Dozen Payloads Handled
1. Unauthenticated write -> PERMISSION_DENIED
2. Malformed document ID with special characters or excessive length -> PERMISSION_DENIED
3. Oversized description (> 4000 chars) -> PERMISSION_DENIED
4. Missing required fields in Proyecto (e.g. missing `nombre`) -> PERMISSION_DENIED
5. Missing required fields in Solicitud -> PERMISSION_DENIED
6. Missing required fields in Prueba -> PERMISSION_DENIED
7. Missing required fields in RegistroHoras -> PERMISSION_DENIED
8. Unverified email user attempting mutation -> PERMISSION_DENIED
9. Injecting illegal types (e.g. number instead of string for `codigo`) -> PERMISSION_DENIED
10. Modifying immutable ID on update -> PERMISSION_DENIED
11. Blanket write to unauthorized collection -> PERMISSION_DENIED
12. Attempt to write arbitrary ghost keys beyond schema bounds -> PERMISSION_DENIED
