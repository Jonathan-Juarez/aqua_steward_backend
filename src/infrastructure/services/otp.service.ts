import { BadRequestError } from "../errors/BadRequestError";

let cachedToken: string | null = null;

async function getToken(refresh = false): Promise<string> {
    if (!refresh && cachedToken) return cachedToken;
    const res = await fetch(`${process.env.OTP_BASE_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: process.env.OTP_SERVICE_EMAIL,
            password: process.env.OTP_SERVICE_PASSWORD,
        }),
    });
    const data: any = await res.json().catch(() => ({}));
    if (res.ok && data.token) return (cachedToken = data.token);
    throw new BadRequestError("Error de autenticación con el servicio OTP");
}

export async function sendOtp(email: string): Promise<void> {
    let token = await getToken();
    const payload = JSON.stringify({
        email: email.trim(),
        subject: "Verificación para AquaSteward",
        message: "Verifica tu email con el siguiente código",
        duration: 1,
    });

    let res = await fetch(`${process.env.OTP_BASE_URL}/otp_app/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-access-token": token },
        body: payload,
    });

    // Si es unauthorized o forbidden, se intenta obtener un nuevo token y se reintenta la petición.
    if (res.status === 401 || res.status === 403) {
        token = await getToken(true);
        res = await fetch(`${process.env.OTP_BASE_URL}/otp_app/`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-access-token": token },
            body: payload,
        });
    }

    if (!res.ok) {
        const err: any = await res.json().catch(() => ({}));
        throw new BadRequestError(err.message || err.error || "Error al solicitar código OTP");
    }
}

export async function verifyOtp(email: string, otp: string): Promise<boolean> {
    const token = await getToken();
    const res = await fetch(`${process.env.OTP_BASE_URL}/email_verification/verifyOTP`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-access-token": token },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
    });
    const data: any = await res.json().catch(() => ({}));
    if (res.ok && data.verified === true) return true;
    throw new BadRequestError(data.message || data.error || "Código de verificación inválido");
}
