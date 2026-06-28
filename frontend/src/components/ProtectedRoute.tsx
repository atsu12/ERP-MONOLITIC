import {
  Navigate
} from "react-router-dom";

import {
  useAuthStore
} from "../store/authStore";

import Unauthorized
  from "../pages/Unauthorized";

interface Props {

  children: JSX.Element;

  allowedRoles?: string[];

}

function ProtectedRoute({
  children,
  allowedRoles
}: Props) {

  const authenticated =
    useAuthStore(
      (state) =>
        state.authenticated
    );

  const user =
    useAuthStore(
      (state) =>
        state.user
    );

  // NOT AUTHENTICATED

  if (!authenticated) {

    return (
      <Navigate to="/login" />
    );

  }

  // NO USER

  if (!user) {

    return (
      <Navigate to="/login" />
    );

  }

  // ROLE CHECK

  if (

    allowedRoles &&

    !allowedRoles.includes(
      user.role
    )

  ) {

   return <Unauthorized />;

  }

  return children;

}

export default ProtectedRoute;