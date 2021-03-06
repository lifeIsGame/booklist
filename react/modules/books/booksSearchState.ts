import shallowEqual from "shallow-equal/objects";

import { useMemo, useReducer, useContext } from "react";
import { useTagsState } from "app/state/tagsState";

import { defaultSearchValuesHash, filtersFromUrl } from "./booksLoadingUtils";
import { useSubjectsState } from "app/state/subjectsState";
import { AppContext } from "app/renderUI";

const bookSearchInitialState = {
  hashFilters: {} as typeof defaultSearchValuesHash
};
export type BookSearchState = typeof bookSearchInitialState;

export function bookSearchReducer(state = bookSearchInitialState, action): BookSearchState {
  switch (action.type) {
    case "SYNC_HASH":
      let { filters } = action;
      if (!shallowEqual(filters, state.hashFilters)) {
        return { ...state, hashFilters: filters };
      }
      return state;
  }
  return state;
}

export type TagOrSubject = {
  _id: string;
  name: string;
};
export type LookupHashType = {
  [str: string]: TagOrSubject;
};

export function useBooksSearchState(): [BookSearchState, any] {
  let [appState] = useContext(AppContext);
  let initialSearchState = useMemo(() => ({ ...bookSearchInitialState, hashFilters: appState.urlState.searchState }), []);
  let [result, dispatch] = useReducer(bookSearchReducer, initialSearchState);

  if (!shallowEqual(appState.urlState.searchState, result.hashFilters) && (appState.module == "books" || appState.module == "view")) {
    dispatch({ type: "SYNC_HASH", filters: appState.urlState.searchState });
  }

  return [result, dispatch];
}

export const useSelectedSubjects = () => {
  const [{ hashFilters }] = useBooksSearchState();
  const { subjects } = hashFilters;
  const { subjectHash } = useSubjectsState();

  return useMemo(() => projectSelectedItems(subjects, subjectHash), [subjects, subjectHash]);
};

export const useSelectedTags = () => {
  const [{ hashFilters }] = useBooksSearchState();
  const { tags } = hashFilters;
  const { tagHash } = useTagsState();

  return useMemo(() => projectSelectedItems(tags, tagHash), [tags, tagHash]);
};

function projectSelectedItems(ids: string = "", hash): TagOrSubject[] {
  return ids
    .split("-")
    .map(_id => (_id ? hash[_id] : null))
    .filter(res => res);
}

const keyIsFilter = k => k != "page" && k != "sort" && k != "sortDirection" && k != "userId";

export const useCurrentSearch = () => {
  const [{ hashFilters: filters }] = useBooksSearchState();
  const { subjects: subjectsHashValue, tags: tagsHashValue } = filters;

  const subjects = useSelectedSubjects();
  const tags = useSelectedTags();

  return useMemo(() => {
    let result = Object.assign({}, filtersFromUrl(filters), {
      selectedSubjects: subjects,
      selectedTags: tags
    });

    return Object.assign({}, result, {
      anyActiveFilters: !!Object.keys(filters).filter(keyIsFilter).length,
      activeFilterCount: Object.keys(filters).filter(keyIsFilter).length,
      bindableSortValue: `${result.sort}|${result.sortDirection}`
    });
  }, [filters, subjects, tags, subjectsHashValue, tagsHashValue]);
};
