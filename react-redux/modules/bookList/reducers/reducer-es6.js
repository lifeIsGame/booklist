const { LOAD_BOOKS, LOAD_BOOKS_RESULTS, EDIT_SUBJECTS_FOR, MODIFY_SUBJECTS, MODIFY_SUBJECTS_RESULTS, LOAD_SUBJECTS, LOAD_SUBJECTS_RESULTS,
        TOGGLE_SELECT_BOOK, SELECT_ALL_BOOKS, DE_SELECT_ALL_BOOKS, EDIT_SUBJECT } = require('../actions/actionNames');

const initialState = () => ({
    bookList: [],
    subjects: []
});

var i = 0;

function reducer(state = initialState(), action = {}){
    switch(action.type){
        case LOAD_BOOKS:
            return Object.assign({}, state, { loading: true });
        case LOAD_BOOKS_RESULTS:
            setBookResultsSubjects(action.bookList, state.subjects);
            return Object.assign({}, state, { loading: false, bookList: true || i++ % 2 == 0 ? action.bookList : [] });
        case EDIT_SUBJECTS_FOR:
            return Object.assign({}, state);
        case MODIFY_SUBJECTS:
            return Object.assign({}, state);
        case MODIFY_SUBJECTS_RESULTS:
            return Object.assign({}, state);
        case LOAD_SUBJECTS:
            return Object.assign({}, state);
        case LOAD_SUBJECTS_RESULTS:
            return Object.assign({}, state, { subjects: stackSubjects(action.subjects) });
        case TOGGLE_SELECT_BOOK:
            var newBookList = state.bookList.map(b => Object.assign({}, b, { selected: b._id == action._id ? !b.selected : b.selected }))
            return Object.assign({}, state, { bookList: newBookList, selectedCount: newBookList.filter(b => b.selected).length });
        case SELECT_ALL_BOOKS:
            var newBookList = state.bookList.map(b => Object.assign({}, b, { selected: true }));
            return Object.assign({}, state, { bookList: newBookList, selectedCount: newBookList.length });
        case DE_SELECT_ALL_BOOKS:
            var newBookList = state.bookList.map(b => Object.assign({}, b, { selected: false }));
            return Object.assign({}, state, { bookList: newBookList, selectedCount: 0 });
        case EDIT_SUBJECT:
            var editingSubject = Object.assign({}, [...flattenedSubjects(state.subjects)].find(s => s._id == action._id));

            var eligibleParents = [...flattenedSubjects(state.subjects)]
                .filter(s => s._id !== action._id && (!new RegExp(`,${action._id},`).test(s.path) && !new RegExp(`,${s._id},$`).test(editingSubject.path)))
                .map(o => Object.assign({}, o));

            return Object.assign({}, state, { editingSubject, eligibleParents });
    }

    return state;
}

function *flattenedSubjects(subjects){
    for (let subject of subjects){
        yield subject;
        if (subject.children.length) {
            yield* flattenedSubjects(subject.children);
        }
    }
}

function stackSubjects(subjects){
    subjects.forEach(s => {
        s.children = [];
        s.children.push(...subjects.filter(sc => new RegExp(`,${s._id},$`).test(sc.path)));
    });
    return subjects.filter(s => s.path == null);
}

function setBookResultsSubjects(books, subjects){
    let subjectLookup = { };
    subjects.forEach(s => subjectLookup[s._id] = s.name);

    books.forEach(b => b.subjects = b.subjects.map(s => ({ _id: s, name: subjectLookup[s] || '<subject not found>' })));
}

module.exports = reducer;