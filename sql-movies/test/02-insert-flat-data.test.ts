import _ from "lodash";
import { Database } from "../src/database";
import { CsvLoader } from "../src/data/csv-loader";
import {
  selectActorByName,
  selectCount,
  selectKeyword,
  selectDirector,
  selectGenre,
  selectProductionCompany,
  selectMovie
} from "../src/queries/select";
import {
  ACTORS,
  KEYWORDS,
  DIRECTORS,
  GENRES,
  PRODUCTION_COMPANIES,
  MOVIES
} from "../src/table-names";
import { Movie } from "../src/data/types";
import { escape } from "../src/utils";
import { minutes } from "./utils";

const insertActors = async (db: Database, actors: string[]) => {
  const chunks = _.chunk(actors, 500);

  for (const ch of chunks) {
    await db.insert(`INSERT INTO actors (full_name) VALUES ${ch.map(actor => `('${escape(actor)}')`).join(",")}`);
  }
};

const insertKeywords = async (db: Database, keywords: string[]) => {
  const chunks = _.chunk(keywords, 500);

  for (const ch of chunks) {
    await db.insert(`INSERT INTO keywords (keyword) VALUES ${ch.map(keyword => `('${escape(keyword)}')`).join(",")}`);
  }
};

const insertDirectors = async (db: Database, directors: string[]) => {
  const chunks = _.chunk(directors, 500);

  for (const ch of chunks) {
    await db.insert(`INSERT INTO directors (full_name) VALUES ${ch.map(director => `('${escape(director)}')`).join(",")}`);
  }
};

const insertGenres = async (db: Database, genres: string[]) => {
  await db.insert(`INSERT INTO genres (genre) VALUES ${genres.map(genre => `('${escape(genre)}')`).join(",")}`);
};

const insertProductionCompanies = async (db: Database, companies: string[]) => {
  const chunks = _.chunk(companies, 500);

  for (const ch of chunks) {
    await db.insert(`INSERT INTO production_companies (company_name) VALUES ${ch.map(company => `('${escape(company)}')`).join(",")}`);
  }
};

const insertMovies = async (db: Database, movies: Movie[]) => {
  const chunks = _.chunk(movies, 500);

  for (const ch of chunks) {
    const values = ch
      .map(
        movie => `('${escape(movie.imdbId)}', ${movie.popularity}, ${movie.budget}, ${movie.revenue}, '${escape(movie.originalTitle)}',
        '${escape(movie.homepage)}', '${escape(movie.tagline || '')}', '${escape(movie.overview)}', ${movie.runtime}, '${escape(movie.releaseDate)}',
        ${movie.budgetAdjusted}, ${movie.revenueAdjusted})`
      )
      .join(",");

    await db.insert(`INSERT INTO movies (imdb_id, popularity, budget, revenue, original_title, homepage, tagline, overview, runtime, release_date, budget_adjusted, revenue_adjusted) VALUES ${values}`);
  }
};

describe("Insert Flat Data", () => {
  let db: Database;

  beforeAll(async () => {
    db = await Database.fromExisting("01", "02");
    await CsvLoader.load();
  }, minutes(1));

  it(
    "should insert actors",
    async done => {
      const actors = await CsvLoader.actors();
      await insertActors(db, actors);

      const count = await db.selectSingleRow(selectCount(ACTORS));
      expect(count.c).toBe(actors.length);

      const actor = await db.selectSingleRow(selectActorByName("Tom Hardy"));
      expect(actor.id).not.toBeNaN();
      expect(actor.full_name).toEqual("Tom Hardy");

      done();
    },
    minutes(1)
  );

  it(
    "should insert keywords",
    async done => {
      const keywords = await CsvLoader.keywords();
      await insertKeywords(db, keywords);

      const count = await db.selectSingleRow(selectCount(KEYWORDS));
      expect(count.c).toBe(keywords.length);

      const row = await db.selectSingleRow(selectKeyword("teddy bear"));
      expect(row.id).not.toBeNaN();
      expect(row.keyword).toEqual("teddy bear");

      done();
    },
    minutes(1)
  );

  it(
    "should insert directors",
    async done => {
      const directors = await CsvLoader.directors();
      await insertDirectors(db, directors);

      const count = await db.selectSingleRow(selectCount(DIRECTORS));
      expect(count.c).toBe(directors.length);

      const row = await db.selectSingleRow(selectDirector("Alan Taylor"));
      expect(row.id).not.toBeNaN();
      expect(row.full_name).toEqual("Alan Taylor");

      done();
    },
    minutes(1)
  );

  it(
    "should insert genres",
    async done => {
      const genres = await CsvLoader.genres();
      await insertGenres(db, genres);

      const count = await db.selectSingleRow(selectCount(GENRES));
      expect(count.c).toBe(genres.length);

      const row = await db.selectSingleRow(selectGenre("Fantasy"));
      expect(row.id).not.toBeNaN();
      expect(row.genre).toEqual("Fantasy");

      done();
    },
    minutes(1)
  );

  it(
    "should insert production companies",
    async done => {
      const productionCompanies = await CsvLoader.productionCompanies();
      await insertProductionCompanies(db, productionCompanies);

      const count = await db.selectSingleRow(selectCount(PRODUCTION_COMPANIES));
      expect(count.c).toBe(productionCompanies.length);

      const row = await db.selectSingleRow(
        selectProductionCompany("Universal Pictures")
      );
      expect(row.id).not.toBeNaN();
      expect(row.company_name).toEqual("Universal Pictures");

      done();
    },
    minutes(1)
  );

  it(
    "should insert movies",
    async done => {
      const movies = await CsvLoader.movies();
      await insertMovies(db, movies);

      const count = await db.selectSingleRow(selectCount(MOVIES));
      expect(count.c).toBe(movies.length);

      const row = await db.selectSingleRow(selectMovie("tt0369610"));
      expect(row.id).not.toBeNaN();
      expect(row.original_title).toEqual("Jurassic World");

      done();
    },
    minutes(1)
  );
});