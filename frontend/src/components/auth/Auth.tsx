import { useEffect } from "react";
import useAuthStore from "../../store/AuthStore";

//@ts-ignore
export default function Auth({ children }) {
  //@ts-ignore
  const { loginWithToken, tokenLoading } = useAuthStore((state) => state);

  useEffect(() => {
    loginWithToken();
  }, []);

  return <div>{tokenLoading ? "" : children}</div>;
}
