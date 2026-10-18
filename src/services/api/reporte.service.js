import { http } from "./http";

export const reporteService = {
  getDashboard: (arg1, arg2, arg3) => {
    let emisor_id = 1;
    let mes;
    let anio;

    if (arg3 !== undefined) {
      emisor_id = arg1;
      mes = arg2;
      anio = arg3;
    } else {
      mes = arg1;
      anio = arg2;
    }

    return http.get("/reportes/dashboard", {
      params: { emisor_id, mes, anio }
    });
  }
};
