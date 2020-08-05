import { Response } from "./response";

export default (code = 500, message = "Unexpected error."): Response => {
  return {
    error: {
      code,
      message,
    },
  };
};
