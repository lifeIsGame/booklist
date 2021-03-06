import React, { useState } from "react";
import { useQuery, buildQuery } from "micro-graphql-react";

import SummaryQuery from "graphQL/admin/bookSummaryCoverInfo.graphql";
import styles from "./styles.module.css";
const { bookList, bookDisplay, img, bookInfo, title, author } = styles;

import ajaxUtil from "util/ajaxUtil";
import { syncUpdates } from "util/graphqlHelpers";
import { QueryOf, Queries } from "graphql-typings";

export const updateSmallCover = ({ _id, url }) => {
  return ajaxUtil
    .post("/bookSummary/newSmallImage", { _id, url })
    .then(({ url, failure }) => {
      if (!failure && url) {
        syncUpdates(SummaryQuery, { _id, smallImage: url }, "allBookSummarys", "BookSummarys", { force: true });
      }
      return { url, failure };
    })
    .catch(() => ({ failure: true, url: "" }));
};

const BookSummaryDisplay = props => {
  const { book } = props;
  const [newUrl, setNewUrl] = useState("");

  const changeImg = evt => {
    evt.preventDefault();
    updateSmallCover({ _id: book._id, url: newUrl }).then(() => setNewUrl(""));
  };

  return (
    <div className={bookDisplay}>
      <div className={img}>
        <img src={book.smallImage} />
      </div>
      <div className={bookInfo}>
        <div className={title}>
          <a target="_blank" href={`https://amazon.com/s?k=${book.title.replace(/\s+/g, "+")}`}>
            {book.title}
          </a>
        </div>
        <div className={author}>{(book.authors || []).join(", ")}</div>
        <form onSubmit={changeImg}>
          <div className="btn-group">
            <input className="form-control" placeholder="New Cover URL" value={newUrl} onChange={evt => setNewUrl(evt.target.value)} />
            <button disabled={!newUrl} onClick={changeImg} className="btn btn-default">
              <i className="far fa-cloud-upload-alt" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default props => {
  const [missingCoversFilter, setMissingCoversFilter] = useState(true);

  const imgFilter = missingCoversFilter ? "nophoto" : void 0;

  const { data, loaded } = useQuery<QueryOf<Queries["allBookSummarys"]>>(buildQuery(SummaryQuery, { smallImage: imgFilter }));
  const bookSummaries = data ? data.allBookSummarys.BookSummarys : [];

  return (
    <div className={bookList}>
      <label>
        Books missing covers <input type="checkbox" checked={missingCoversFilter} onChange={evt => setMissingCoversFilter(evt.target.checked)} />
      </label>
      <br />
      <br />
      {loaded ? (
        <div>
          {bookSummaries.map(book => (
            <BookSummaryDisplay key={book._id} book={book} />
          ))}
        </div>
      ) : (
        <span>
          Loading ... <i className="fa fa-spinner fa-spin" />
        </span>
      )}
    </div>
  );
};
