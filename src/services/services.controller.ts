import { Controller, Get, HttpException, HttpStatus, Query } from '@nestjs/common';

import "reflect-metadata";
import { getConnection, ILike } from "typeorm";
import { Service } from "../entity/Service";

// We said this was fixed, so I'll make it a constant
const EntriesPerPage = 12;

@Controller('services')
export class ServicesController {
  @Get('getAll')
  async getAll(@Query("page") qpage: string, @Query("filter") filter: string): Promise<object> {

    const connection = getConnection();

    const services = connection.getRepository(Service);

    // Default filter to empty string if undefined
    filter = filter ? filter : "";

    const filterCriteria = [
      // Check both the name or the description
      // If filter is an empty string, this isn't a problem
      { name: ILike(`%${filter}%`) },
      { description: ILike(`%${filter}%`)}
    ]

    // Even if you type qpage as a number above, it comes in as a string. So we can't use it directly.
    const page = parseInt(qpage)
    /**
     * More accurately, we *could* use it directly, and because of javascript's type coersion, it
     * would work fine most of the time. The problems it would cause are minor, since both ways will
     * resolve non-numbers like they were 0 (really NaN, but for our purposes, it works the same).
     * 
     * The main reason to do it this way is it disallows non-integer pages (e.g. 1.5), and we can
     * be simpler on the nextPage route, because we can just use ${page+1} instead of having to do
     * ${+qpage+1} to cast it to a number. Everywhere else, a string gets coerced into a number properly.
     */

    if (page < 1) {
      // This will hit a 500 if we let the query go through, because skip will be negative
      // So we'll stop it and mark it a bad request
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST)
    }

    // Get a page's worth of entries, ordered by date, skipping previous pages
    const thisPage = await services.find({
      order: {
        created_at: "ASC"
      },
      where: filterCriteria,
      // Pages are 1 indexed
      skip: EntriesPerPage*(page-1),
      /**
       * You could 0 index them, and not need this. The only difference would be the url says 0 when
       * the page says 1, but the url is still user-visible, so having them agree is a little nicer.
       */
      take: EntriesPerPage,
      relations: ['versions']
    });
    
    // If filter is defined, then include it in the following, otherwise, include nothing
    const filterQuery = filter ? `&filter=${filter}` : ''

    const totalEntries = await services.count({ where: filterCriteria })

    let nextPage = null;
    // If we're not on the last page, next page is defined
    if (page < totalEntries / EntriesPerPage) {
      nextPage = `/services/getAll?page=${page+1}${filterQuery}`;
    }

    let previousPage = null;
    // If we're not on page 1, previous page is defined
    if (page > 1) {
      previousPage = `/services/getAll?page=${page-1}${filterQuery}`;
    }

    /**
     * I'm not sure on this. As is, if someone manually writes a url with a page number higher
     * than the maximum, it just returns an empty list of services, with a null next page, and
     * a previous page pointing one lower (which might still be an empty page). I'm not sure
     * how best to handle this. I don't think the current way is necessarily bad, but it seems like
     * it might be improvable. For example, if previous page pointed to the last filled page (though
     * that could also be confusing, if page 32's "previous page" was page 5). Or perhaps if too-high
     * page numbers sent back a 404, but I don't really think it should be an exception.
     * 
     * Since I can't decide what, if anything, would be better, I'm going to leave it as is.
     */

    return {
      services: thisPage,
      previousPage: previousPage,
      nextPage: nextPage
    }
  }

  @Get('getOne')
  async getOne(@Query("id") id: number): Promise<object> {
    const connection = getConnection();

    const services = connection.getRepository(Service);

    /**
     * Easiest way to handle invalid ids is just to put it in a try catch.
     * Could also do manual input validation, (i.e. parseInt(id), 
     * if (id === NaN) throw...) but it wouldn't end up any different.
     * I'm not sure if there's a performance difference between the two, or
     * which would be favored.
     */
    try {
      // Get the service with the given id, plus associated versions
      const service = await services.find({
        where: {
          id: id
        },
        relations: ['versions']
      });
    
      return service;
    } catch (error) {
      // Someone probably put a non-integer in as id
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
    }
  }
}
