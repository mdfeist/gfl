import { Response } from "./response";

export default (): Response => {
  return {
    error: {
      code: 401,
      message: "Request had invalid credentials.",
    },
  };
};
