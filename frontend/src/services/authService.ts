import { apiRequest } from "./api";

// LOGIN

export async function loginUser(
  username: string,

  password: string,
) {
  const data = await apiRequest("/login", {
    method: "POST",

    body: JSON.stringify({
      username,
      password,
    }),
  });

  // SAVE TOKEN

  localStorage.setItem("token", data.token);

  // SAVE USER

  localStorage.setItem("user", JSON.stringify(data.user));

  return data.user;
}

// LOGOUT

export function logoutUser() {
  localStorage.removeItem("token");

  localStorage.removeItem("user");
}

// GET TOKEN

export function getToken() {
  return localStorage.getItem("token");
}

// GET USER

export function getCurrentUser() {
  const user = localStorage.getItem("user");

  return user ? JSON.parse(user) : null;
}

// CHECK AUTH

export function isAuthenticated() {
  return !!getToken();
}

// CHANGE PASSWORD

export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  return apiRequest("/users/change-password", {
  method: "PUT",
  auth: true,
  body: JSON.stringify({
    currentPassword,
    newPassword,
  }),
});
}