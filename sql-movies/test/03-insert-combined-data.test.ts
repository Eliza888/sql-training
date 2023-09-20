import _ from "lodash";
import { Database } from "../src/database";
import { CsvLoader } from "../src/data/csv-loader";
import {
  selectCount,
  selectRatingsByUserID,
  selectMovieId
} from "../src/queries/select";
import { MOVIE_RATINGS } from "../src/table-names";
import { Rating } from "../src/data/types";
import { minutes } from "./utils";

let db: Database;

const insertRatings = async (movieId: number, ratings: Rating[]) => {
  const batchSize = 50000; // Increased batch size to 50,000
  for (let i = 0; i < ratings.length; i += batchSize) {
    const batch = ratings.slice(i, i + batchSize);
    const insertStatements = batch.map((rating) => {
      return `INSERT INTO ${MOVIE_RATINGS} (user_id, movie_id, rating, time_created) 
            VALUES (${rating.userId}, ${movieId}, ${rating.rating}, '${rating.time_created}')`;
    });
    const insertQuery = insertStatements.join(";");
    await db.insert(insertQuery);
  }
};

describe("Insert Combined Data", () => {
  beforeAll(async () => {
    db = await Database.fromExisting("02", "03");
    await CsvLoader.load();
  }, minutes(3));

  it(
    "should insert movie ratings",
    async (done) => {
      const ratingsByImdbId = _.groupBy(await CsvLoader.ratings(), "imdbId");

      for (const imdbId of Object.keys(ratingsByImdbId)) {
        const movieId = (await db.selectSingleRow(selectMovieId(imdbId))).id;
        const ratings = ratingsByImdbId[imdbId];
        await insertRatings(movieId, ratings);
      }

      const count = await db.selectSingleRow(selectCount(MOVIE_RATINGS));
      expect(count.c).toBe(165859);

      const row = await db.selectSingleRow(selectRatingsByUserID(2));

      expect(row.id).not.toBeNaN();
      expect(row.user_id).toBe(2);
      expect(row.rating).toBe(3.0);
      expect(row.time_created).toBe("1997-06-23 04:12:48");

      done();
    },
    minutes(30)
  );
});