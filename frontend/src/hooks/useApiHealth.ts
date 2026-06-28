import {
  useEffect,
  useState
} from "react";

const API_URL =
  import.meta.env.VITE_API_URL;

export function useApiHealth() {

  const [apiOnline,
    setApiOnline] =
      useState(true);

  useEffect(() => {

    const checkHealth =
      async () => {

        try {

          const response =
            await fetch(
              `${API_URL}/health`
            );

          setApiOnline(
            response.ok
          );

        } catch {

          setApiOnline(false);

        }

      };

    checkHealth();

    const interval =
      setInterval(
        checkHealth,
        10000
      );

    return () => {

      clearInterval(
        interval
      );

    };

  }, []);

  return {
    apiOnline
  };

}
