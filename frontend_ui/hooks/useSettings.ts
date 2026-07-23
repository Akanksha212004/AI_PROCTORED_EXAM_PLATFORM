"use client";

// hooks/useSettings.ts

import Cookies from "js-cookie";
import { useState } from "react";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";
const TOKEN_COOKIE = "access_token";

async function authedFetch(path: string, init?: RequestInit) {
  const token = Cookies.get(TOKEN_COOKIE);
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

export function useSettings() {
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  async function updateProfile(name: string) {
    setIsSavingProfile(true);
    try {
      const result = await authedFetch("/users/me/profile", {
        method: "PATCH",
        body: JSON.stringify({ name }),
      });
      toast.success("Profile updated");
      return result;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update profile");
      throw err;
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    setIsSavingPassword(true);
    try {
      await authedFetch("/users/me/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      toast.success("Password updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
      throw err;
    } finally {
      setIsSavingPassword(false);
    }
  }

  return { updateProfile, changePassword, isSavingProfile, isSavingPassword };
}
