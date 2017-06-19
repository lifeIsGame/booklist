import {BooksModuleType, appType, booksType, bookSearchType, booksTagModificationType, editBookType, tagsType} from 'modules/books/reducers/reducer';

import React, {Component} from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';

import GV from './bookViewList-grid';
const GridView : any = GV;

import BLV from './bookViewList-basicList';
const BasicListView : any = BLV;

import BMB from './booksMenuBar';
const BooksMenuBar : any = BMB;

import * as actionCreatorsEditBook from '../reducers/editBook/actionCreators';
import * as actionCreatorsSearch from '../reducers/bookSearch/actionCreators';
import Loading from 'applicationRoot/components/loading';
import Loadable from 'react-loadable';

import {booksListType, selectBookList, selectBookSelection, bookSelectionType} from '../reducers/books/reducer';
import {selectModifyingBooks as tagsBooksModifyingSelector, modifyingBooksType as tagsBooksModifyingType} from '../reducers/booksTagModification/reducer';
import {selectBookSearchUiView, bookSearchUiViewType} from '../reducers/bookSearch/reducer';

import ComponentLoading from 'applicationRoot/components/componentLoading';

const ManualBookEntry = Loadable({
    loader: () => System.import(/* webpackChunkName: "manual-book-entry-modal" */ 'applicationRoot/components/manualBookEntry'),
    LoadingComponent: ComponentLoading,
    delay: 500
});

const BookSubjectSetter = Loadable({
    loader: () => System.import(/* webpackChunkName: "book-list-modals" */ './bookSubjectSetter'),
    LoadingComponent: ComponentLoading,
    delay: 500
});

const BookTagSetter = Loadable({
    loader: () => System.import(/* webpackChunkName: "book-list-modals" */ './bookTagSetter'),
    LoadingComponent: ComponentLoading,
    delay: 500
});

const SubjectEditModal = Loadable({
    loader: () => System.import(/* webpackChunkName: "book-list-modals" */ './subjectEditModal'),
    LoadingComponent: ComponentLoading,
    delay: 500
});

const TagEditModal = Loadable({
    loader: () => System.import(/* webpackChunkName: "book-list-modals" */ './tagEditModal'),
    LoadingComponent: ComponentLoading,
    delay: 500
});

const BookSearchModal = Loadable({
    loader: () => System.import(/* webpackChunkName: "book-list-modals" */ './bookSearchModal'),
    LoadingComponent: ComponentLoading,
    delay: 500
});

type actionsType = typeof actionCreatorsEditBook & typeof actionCreatorsSearch;
type mainSelectorType = editBookType & bookSearchUiViewType & booksListType & bookSelectionType & {
    subjectsLoaded: boolean;
    tagsLoaded: boolean;
    editingBookSearchFilters: boolean;
    tagsBooksModifyingCount: number;
}

const mainSelector = createSelector<BooksModuleType, mainSelectorType, appType, editBookType, tagsType, bookSearchType, booksListType, bookSelectionType, bookSearchUiViewType, tagsBooksModifyingType>(
    state => state.app,
    state => state.booksModule.editBook,
    state => state.booksModule.tags,
    state => state.booksModule.bookSearch,
    selectBookList,
    selectBookSelection,
    selectBookSearchUiView,
    tagsBooksModifyingSelector,
    (app, editBook, tags, bookSearch, books, bookSelection, bookSearchUi, tagsBooksModifying) => {
        return {
            subjectsLoaded: app.subjectsLoaded,
            ...editBook,
            tagsLoaded: tags.loaded,
            editingBookSearchFilters: bookSearch.editingFilters,
            ...books,
            ...bookSearchUi,
            tagsBooksModifyingCount: tagsBooksModifying.length,
            ...bookSelection
        };
    }
);

@connect(mainSelector, { ...actionCreatorsEditBook, ...actionCreatorsSearch })
export default class BookViewingList extends Component<mainSelectorType & actionsType, any> {
    state = { 
        navBarHeight: null, 
        tagEditModalOpen: false,
        subjectEditModalOpen: false,
        booksSubjectModifying: null
    }
    editTags = () => this.setState({tagEditModalOpen: true});
    stopEditingTags = () => this.setState({tagEditModalOpen: false});
    editSubjects = () => this.setState({subjectEditModalOpen: true});
    stopEditingSubjects = () => this.setState({subjectEditModalOpen: false});

    editSubjectsForBook = book => {
        this.setState({booksSubjectModifying: [book]});
    }
    editSubjectsForSelectedBooks = () => {
        this.setState({booksSubjectModifying: this.props.booksList.filter(b => this.props.selectedBookHash[b._id])});
    }
    doneEditingBooksSubjects = () => {
        this.setState({booksSubjectModifying: null});
    }
    
    navBarSized = (contentRect) => {
        this.setState({navBarHeight: contentRect.client.height});
    }
    render() {
        let editingBook = this.props.editingBook,
            dragTitle = editingBook ? `Click or drag to upload a ${editingBook.smallImage ? 'new' : ''} cover image.  The uploaded image will be scaled down as needed` : '';

        return (
            <div style={{position: 'relative'}}>
                {this.props.booksLoading || !this.props.subjectsLoaded || !this.props.tagsLoaded ? <Loading /> : null }
                <div className="panel panel-default" style={{ margin: '10px' }}>
                    <BooksMenuBar startSubjectModification={this.editSubjectsForSelectedBooks} editTags={this.editTags} editSubjects={this.editSubjects} navBarSized={this.navBarSized} />
                    <div className="panel-body" style={{ padding: 0, minHeight: 450, position: 'relative' }}>

                        {(!this.props.booksList.length && !this.props.booksLoading) ?
                            <div className="alert alert-warning" style={{borderLeftWidth: 0, borderRightWidth: 0, borderRadius: 0}}>
                                No books found
                            </div> : null }

                        {this.props.subjectsLoaded && this.props.tagsLoaded ?
                            (this.props.isGridView ? <GridView editBooksSubjects={this.editSubjectsForBook} navBarHeight={this.state.navBarHeight} />
                                : this.props.isBasicList ? <BasicListView />
                                : null) : null }

                        {this.props.isEditingBook ? 
                            <ManualBookEntry
                                title={editingBook ? `Edit ${editingBook.title}` : ''}
                                dragTitle={dragTitle}
                                bookToEdit={editingBook}
                                isOpen={this.props.isEditingBook}
                                isSaving={this.props.editingBookSaving}
                                isSaved={this.props.editingBookSaved}
                                saveBook={book => this.props.saveEditingBook(book)}
                                saveMessage={'Saved'}
                                onClosing={this.props.stopEditingBook} /> : null
                        }
                        
                    </div>
                </div>
                <br />
                <br />

                {this.state.booksSubjectModifying ? <BookSubjectSetter modifyingBooks={this.state.booksSubjectModifying} onDone={this.doneEditingBooksSubjects} /> : null}
                {this.props.tagsBooksModifyingCount ? <BookTagSetter /> : null}

                {this.state.subjectEditModalOpen ? <SubjectEditModal editModalOpen={this.state.subjectEditModalOpen} stopEditing={this.stopEditingSubjects} /> : null}
                {this.state.tagEditModalOpen ? <TagEditModal editModalOpen={this.state.tagEditModalOpen} onDone={this.stopEditingTags} /> : null}
                {this.props.editingBookSearchFilters ? <BookSearchModal /> : null}
            </div>
        );
    }
}