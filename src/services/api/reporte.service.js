import { http } from "./http";

export const reporteService = {
  getDashboard: (mes, anio) => {
    return http.get("/reportes/dashboard", {
      params: { mes, anio }
    });
  }
};
