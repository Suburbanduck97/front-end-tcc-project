import { useState, useEffect } from 'react';

/**
 * Hook customizado que "atrasa" a atualização de um valor.
 * @param value O valor que você quer "atrasar" (ex: o termo da busca).
 * @param delay O tempo de atraso em milissegundos (ex: 500).
 * @returns O valor "atrasado".
 */
function useDebounce(value, delay) {
  // Estado para guardar o valor "atrasado"
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Cria um "timer"
    const handler = setTimeout(() => {
      setDebouncedValue(value); // Atualiza o valor só depois do "delay"
    }, delay);

    // Função de "limpeza":
    // Se o `value` mudar (usuário digitou de novo),
    // cancela o timer anterior e começa um novo.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Só re-executa se o valor ou o delay mudarem

  return debouncedValue;
}

export default useDebounce;