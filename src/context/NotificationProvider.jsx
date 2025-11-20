import { useEffect, useState } from "react";
import { NotificationContext } from "./NotificationContext.js";
import notificacaoService from "../services/notificacaoService.js";

export const NotificationProvider = ({ children }) => {
  const [naoLidasCount, setNaoLidasCount] = useState(0);

  // Busca no backend a contagem real
  const atualizarContagem = async () => {
    try {
      const dados = await notificacaoService.getMinhas();

      const qtdNaoLidas = dados.filter(n => !n.lida).length;
      setNaoLidasCount(qtdNaoLidas);
    } catch (error) {
      console.error("Erro ao atualizar contagem de notificações", error);
    }
  };

  const decrementarContagem = () =>
    setNaoLidasCount((prev) => (prev > 0 ? prev - 1 : 0));

  return (
    <NotificationContext.Provider
      value={{ naoLidasCount, atualizarContagem, decrementarContagem }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
