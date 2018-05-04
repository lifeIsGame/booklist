import { store } from "applicationRoot/store";
import { SET_GRID_VIEW, SET_BASIC_LIST_VIEW, GRID_VIEW, BASIC_LIST_VIEW, HASH_CHANGED } from "./actionNames";

import { loadBooks } from "../books/actionCreators";
import { loadSubjects } from "applicationRoot/rootReducerActionCreators";
import { loadTags } from "../tags/actionCreators";

import { setSearchValues, getCurrentHistoryState, history } from "reactStartup";
import { selectCurrentSearch } from "./reducer";

export const setViewDesktop = view => ({ type: SET_GRID_VIEW });
export const setViewBasicList = view => ({ type: SET_BASIC_LIST_VIEW });

export const hashChanged = filters => ({ type: HASH_CHANGED, filters });

export function applyFilters(nextState: any) {
  return function(dispatch, getState) {
    let filterSubjectsVal = nextState.subjects.join("-");

    setSearchValues({
      page: null,
      search: nextState.search,
      subjects: filterSubjectsVal,
      tags: nextState.tags.join("-"),
      searchChildSubjects: nextState.searchChildSubjects && filterSubjectsVal ? "true" : null,
      author: nextState.author,
      publisher: nextState.publisher,
      pagesOperator: nextState.pages != "" ? nextState.pagesOperator : null,
      pages: nextState.pages,
      isRead: nextState.isRead,
      noSubjects: nextState.noSubjects ? "true" : ""
    });
  };
}

export function clearAllFilters() {
  return function(dispatch, getState) {
    setSearchValues({
      page: null,
      search: "",
      subjects: "",
      tags: "",
      searchChildSubjects: null,
      author: "",
      publisher: "",
      pagesOperator: null,
      pages: "",
      isRead: "",
      noSubjects: ""
    });
  };
}

export function setSortOrder(sort, sortDirection) {
  return function(dispatch, getState) {
    setSearchValues({
      sort: sort,
      sortDirection,
      page: null
    });
  };
}

export function booksInitialized({ priorState }) {
  let isActive = true;
  let reactivating = false;
  history.listen((location, action) => {
    const { pathname, searchState } = getCurrentHistoryState();
    let nowActive = pathname === "/books" || pathname === "/view";
    reactivating = !isActive && nowActive;
    isActive = nowActive;

    if (isActive) {
      store.dispatch(hashChanged(searchState));
    }
  });
  store.dispatch(hashChanged(getCurrentHistoryState().searchState));
  let lastSearchState = (store.getState() as any).booksModule.bookSearch.hashFilters;

  store.subscribe(() => {
    if (!isActive) return;

    let booksModuleState = (store.getState() as any).booksModule;
    let { reloadOnActivate } = booksModuleState.books;
    let newSearchState = booksModuleState.bookSearch.hashFilters;
    let isReactivating = reactivating;
    reactivating = false; //reset this immediately, before any dispatches

    if (newSearchState !== lastSearchState || (reloadOnActivate && isReactivating)) {
      lastSearchState = newSearchState;
      store.dispatch(loadBooks());
    }
  });

  return function(dispatch, getState) {
    if (!priorState.booksModule) {
      dispatch(loadSubjects());
      dispatch(loadTags());
      dispatch(loadBooks());
    }
  };
}

export function removeFilterSubject(_id) {
  return function(dispatch, getState) {
    let currentSearch = selectCurrentSearch(getState());
    let newSubjects = currentSearch.selectedSubjects.map(s => s._id).filter(sId => sId != _id);

    setSearchValues({
      subjects: newSubjects.join("-"),
      searchChildSubjects: currentSearch.searchChildSubjects && newSubjects ? "true" : null
    });
  };
}

export function removeFilterTag(_id) {
  return function(dispatch, getState) {
    let currentSearch = selectCurrentSearch(getState());
    let newTags = currentSearch.selectedTags.map(s => s._id).filter(sId => sId != _id);

    setSearchValues({ tags: newTags.join("-") });
  };
}

export function clearSearchChildSubjects() {
  return function(dispatch, getState) {
    setSearchValues({ searchChildSubjects: null });
  };
}

export function quickSearch(val) {
  return function(dispatch, getState) {
    let state = getState().booksModule.bookSearch;
    setSearchValues({
      page: null,
      search: val
    });
  };
}

export function pageUp() {
  return function(dispatch, getState) {
    let bookSearchFilters = selectCurrentSearch(getState());
    setSearchValues({ page: +bookSearchFilters.page + 1 });
  };
}

export function pageDown() {
  return function(dispatch, getState) {
    let bookSearchFilters = selectCurrentSearch(getState());
    setSearchValues({ page: +bookSearchFilters.page == 2 ? null : bookSearchFilters.page - 1 });
  };
}
