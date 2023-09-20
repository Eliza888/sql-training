import { Database } from "../src/database";
import { DIRECTORS, GENRES, MOVIES, MOVIE_DIRECTORS, MOVIE_GENRES, MOVIE_RATINGS } from "../src/table-names";
import { minutes } from "./utils";

describe("Queries Across Tables", () => {
  let db: Database;

  beforeAll(async () => {
    db = await Database.fromExisting("06", "07");
  }, minutes(3));

  it(
    "should select top three directors ordered by total budget spent in their movies",
    async done => {
      const query = `      
      SELECT
      ${DIRECTORS}.full_name AS director,
      ROUND(SUM(${MOVIES}.budget_adjusted), 2) AS total_budget
    FROM ${DIRECTORS}
    JOIN ${MOVIE_DIRECTORS} ON ${MOVIE_DIRECTORS}.director_id = ${DIRECTORS}.id
    JOIN ${MOVIES} ON ${MOVIES}.id = ${MOVIE_DIRECTORS}.movie_id
    GROUP BY director
    ORDER BY total_budget DESC
    LIMIT 3;
`;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          director: "Ridley Scott",
          total_budget: 722882143.58
        },
        {
          director: "Michael Bay",
          total_budget: 518297522.1
        },
        {
          director: "David Yates",
          total_budget: 504100108.5
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select top 10 keywords ordered by their appearance in movies",
    async done => {
      const query = `
        SELECT keywords.keyword, COUNT(movie_keywords.keyword_id) AS count
        FROM keywords
        JOIN movie_keywords ON keywords.id = movie_keywords.keyword_id
        GROUP BY keywords.keyword
        ORDER BY count DESC
        LIMIT 10;
      `;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          keyword: "woman director",
          count: 162
        },
        {
          keyword: "independent film",
          count: 115
        },
        {
          keyword: "based on novel",
          count: 85
        },
        {
          keyword: "duringcreditsstinger",
          count: 82
        },
        {
          keyword: "biography",
          count: 78
        },
        {
          keyword: "murder",
          count: 66
        },
        {
          keyword: "sex",
          count: 60
        },
        {
          keyword: "revenge",
          count: 51
        },
        {
          keyword: "sport",
          count: 50
        },
        {
          keyword: "high school",
          count: 48
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select all movies called Life and return the number of actors",
    async done => {
      const query = `
        SELECT movies.original_title, COUNT(movie_actors.actor_id) AS count
        FROM movies
        JOIN movie_actors ON movies.id = movie_actors.movie_id
        WHERE movies.original_title = "Life"
        GROUP BY movies.original_title;
      `;
      const result = await db.selectSingleRow(query);

      expect(result).toEqual({
        original_title: "Life",
        count: 12
      });

      done();
    },
    minutes(3)
  );

  it(
    "should select three genres with the most ratings with 5 stars",
    async done => {
      const query = `
      SELECT ${GENRES}.genre AS genre, COUNT(${MOVIE_RATINGS}.rating) AS five_stars_count
      FROM ${MOVIE_GENRES}
      JOIN ${GENRES} ON ${GENRES}.id = ${MOVIE_GENRES}.genre_id
      JOIN ${MOVIE_RATINGS} ON ${MOVIE_GENRES}.movie_id = ${MOVIE_RATINGS}.movie_id
      WHERE ${MOVIE_RATINGS}.rating = 5.0
      GROUP BY ${GENRES}.genre
      ORDER BY five_stars_count DESC
      LIMIT 3;
      `;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          genre: "Drama",
          five_stars_count: 15052
        },
        {
          genre: "Thriller",
          five_stars_count: 11771
        },
        {
          genre: "Crime",
          five_stars_count: 8670
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select top three genres ordered by average rating",
    async done => {
      const query = `
      SELECT ${GENRES}.genre AS genre, ROUND(AVG(${MOVIE_RATINGS}.rating), 2) AS avg_rating
      FROM ${MOVIE_GENRES}
      JOIN ${GENRES} ON ${GENRES}.id = ${MOVIE_GENRES}.genre_id
      JOIN ${MOVIE_RATINGS} ON ${MOVIE_GENRES}.movie_id = ${MOVIE_RATINGS}.movie_id
      GROUP BY ${GENRES}.genre
      ORDER BY avg_rating DESC
      LIMIT 3;
      `;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          genre: "Crime",
          avg_rating: 3.79
        },
        {
          genre: "Music",
          avg_rating: 3.73
        },
        {
          genre: "Documentary",
          avg_rating: 3.71
        }
      ]);

      done();
    },
    minutes(3)
  );
});