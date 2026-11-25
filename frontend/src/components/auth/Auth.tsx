import { useEffect, type ReactNode } from "react";
import useAuthStore from "../../store/AuthStore";

export default function Auth({ children }: { children: ReactNode }) {
  const loginWithToken = useAuthStore((state) => state.loginWithToken);
  const tokenLoading = useAuthStore((state) => state.tokenLoading);

  useEffect(() => {
    loginWithToken();
  }, []);

  return <div>{tokenLoading ? "" : children}</div>;
}
