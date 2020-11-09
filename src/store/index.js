import Vue from 'vue'

import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({

    state: {
        activeIndex:"/"
    },

    mutations: {
        CHANGE_INDEX: (state, newVal) => {
            state.activeIndex = newVal;
        }
    },

    getters: {
        activeIndex: state => {
            return state.activeIndex;
        }
    },

    actions: {
        changeIndex:({commit, state}, newVal) => {
            return commit("CHANGE_INDEX", newVal)
        }
    },

    modules: {}

})