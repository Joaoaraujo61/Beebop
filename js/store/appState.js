// js/store/appState.js
//
// Estado mínimo da aplicação.
// Hoje controla apenas qual card está marcado como "reproduzindo"
// (um estado puramente visual), porque o projeto ainda não possui
// um elemento <audio> real nem uma integração de dados funcionando
// (js/services/itunesApi.js está vazio).
//
// Quando a reprodução de áudio real for implementada, este mesmo
// campo (playingId) pode ser reaproveitado para sincronizar o
// elemento <audio> com a interface, em vez de criar um novo estado.

const state = {
  playingId: null,
};

const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener({ ...state }));
}

export const appState = {
  /**
   * Inscreve um listener que é chamado imediatamente (com o estado atual)
   * e a cada mudança. Retorna uma função para cancelar a inscrição.
   */
  subscribe(listener) {
    listeners.add(listener);
    listener({ ...state });
    return () => listeners.delete(listener);
  },

  /**
   * Alterna o estado de "reprodução" de uma faixa.
   * Clicar na faixa já ativa pausa; clicar em outra troca o card ativo.
   */
  togglePlay(id) {
    state.playingId = state.playingId === id ? null : id;
    notify();
  },

  get playingId() {
    return state.playingId;
  },
};
