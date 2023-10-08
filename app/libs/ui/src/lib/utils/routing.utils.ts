import { Type } from '@angular/core';
import { UrlSegment } from '@angular/router';
import { PartnerMetadataHelper } from '../decorators';

/**
 * An extremely basic matcher that is basically used to activate routing definitions in exclusive cases of when any particular
 * route that is not explicitly defined above this node is active.
 *
 * In practical terms, this matcher will match *anything* that matches the parent route, and does not match another sibling route that
 * is defined above this node.
 *
 * Example:
 *
 * Say we have a routing structure that is defined under the parent route /book.  This route contains a series of children:
 * - a node at sub-path '/' (defined simply as '')
 * - a node at sub-path '/details'
 * - a node that contains a series of children that all share common parent components
 *
 * The third node contains a series of children components that will need to share parent route aspects (i.e. common parent
 * components, guards, resolves, etc.)  This node needs to be active whenever any of its own child nodes are targeted.
 *
 * The routing definition looks like this:
 *
 * {
 *   path: 'book',
 *   children: [
 *     {
 *       path: '',
 *       component: SomeHomeComponent
 *     },
 *     {
 *       path: 'details',
 *       component: SomeDetailsComponent
 *     },
 *     {
 *       path: catchAllMatcher,
 *       component: SomeCommonForASetOfChildrenComponent,
 *       children: [
 *         {
 *           path: 'step-1',
 *           component: Step1Component
 *         },
 *         {
 *           path: 'step-2',
 *           component: Step2Component
 *         }
 *       ]
 *     }
 *   ]
 * }
 *
 * The node defined with catchAllMatcher will be active whenever any of the sibling nodes defined above this node are NOT active.
 * In the context of this example, this node will be active whenever the path partially matches '/book', but does not exactly
 * match '/book' or '/book/details'.  This means that this node will be active whenever the 'step-1' and 'step-2' nodes are active,
 * which will be matched through the routes '/book/step-1' and '/book/step-2'.
 *
 * The upshot of this design is it allows us to pool common aspects that are shared amongst several components/child routes together
 * in a parent-child relationship WITHOUT introducing another node in the URI navigation path (i.e. in this example, there is no need to
 * add a URI path node for the parent node of step-1 and step-2; this design allows us to pool our common aspects together in the parent
 * routing node as we normally would, but would allow our URI structure to be defined as if the parent node does not exist...
 * in a conventional design, we would be forced to add a parent URI node for 'step-1' and 'step-2' such that their URIs were
 * ultimately matched by '/book/stepper/step-1' and '/book/stepper/step-2'.  This design allows us to successfully avoid adding
 * this unnecessary parent node to the URI structure, which in this case, may be intolerable.
 */
export function catchAllMatcher() {
  return {
    consumed: []
  };
}

export function partnerMatcher(segments: UrlSegment[]) {
  return {
    consumed: segments.length === 1 && !!PartnerMetadataHelper.getPartnerMetadata(segments[0].path) ? segments : []
  };
}

export interface IRouteMatcher {
  match(segments: UrlSegment[]): { consumed: UrlSegment[] };
}

const routeMatcherIndex: {
  [key: string]: {
    type: Type<IRouteMatcher>,
    instance: IRouteMatcher,
  }[]
} = {};

export function RouteMatcher(routeId: string) {
  return (type: Type<IRouteMatcher>) => {
    /* If no matcher index exists for the supplied route ID, create one now. */
    if (!routeMatcherIndex[routeId]) {
      routeMatcherIndex[routeId] = [];
    }

    routeMatcherIndex[routeId].push({ type, instance: null });
  }
}

/**
 * Since the signature of matcher functions is (segments: UrlSegment[]) => UrlSegment[], this function is meant to be used within
 * wrapper functions that specifically indicate the routeId to this function.
 *
 * This goofy structure is required because the AOT compiler requires all decorator values to be statically-defined.  No
 * dynamic logic is permitted.
 */
export function routeMatcher(segments: UrlSegment[], routeId: string) {
  /* Cycle through the matchers until we get a result that actually consumes something. */
  const matcherIndex = routeMatcherIndex[routeId] || [];
  let result: { consumed: UrlSegment[] } = { consumed: [] };

  for (let i = 0; i < matcherIndex.length && !result.consumed.length; i++) {
    /* If an instance for this matcher does not yet exist, create one now. */
    if (!matcherIndex[i].instance) {
      matcherIndex[i].instance = new matcherIndex[i].type();
    }

    /* Invoke the matcher's match method, and inspect the results. If the result contains consumed segments, stop execution of the
    loop immediately (loop condition), and return the value. */
    result = matcherIndex[i].instance.match(segments) || result;
  }

  return result;
}

/**
 * Retrieves the path parameters from the supplied path corresponding to the supplied template.  The template is
 * formed using the same syntax as Angular's and Nest's path definitions - path variable nodes should be
 * declared with a colon as the first character, while non-variable path nodes can be declared as a standard
 * string with no specific considerations.
 *
 * This method returns an object that contains key/value pairs for all parameters defined in the template
 * string. If a given parameter is not found in the supplied path string, this method will set the value for
 * the corresponding key in the return object as null.
 *
 * For example:
 *
 * template = /team/:teamId/people/:personId
 * path = /team/12/people/536
 *
 * This template would define a URL shape where the nodes at :teamId and :personId would indicate their respective
 * ID values.  The end result would be an object that is assembled as below:
 * {
 *   teamId: "12",
 *   peopleId: "536",
 * }
 */
export const getPathParameters: <T extends { [key: string]: string } = {[key: string]: string}>(
  pathTemplate: string,
  path: string | UrlSegment[]
) => T = <T>(pathTemplate: string, path: string | UrlSegment[]) => {
  /* If we receive a UrlSegment array, we will need to transform it to a string */
  const pathString = typeof path === 'string' ? path : path.reduce((collector, segment) => {
    return collector + `/${ segment.path }`;
  }, '');

  /* Scan the path template for all variables and their relative match patterns */
  const regex = /([^:]+)(:[^\/]+)/y;
  let matchGroup = regex.exec(pathTemplate);
  let matchPath = '';

  const params: { paramName: string, match: string }[] = [];

  /* Continue iterating through variable identification until we reach a point where we are collecting no
   * more matches. */
  while (matchGroup && matchGroup.length === 3) {
    /* Update the match path to include this item's match template */
    matchPath = matchPath + matchGroup[1];
    params.push({ paramName: matchGroup[2].replace(':', ''), match: matchPath });

    /* Update the matchPath to accommodate the path parameter defined by this value.  This effectively is a
     * node in the URL path that amounts to any string consumed. */
    matchPath = matchPath + '[^\\/]+';

    /* Iterate to the next match group */
    matchGroup = regex.exec(pathTemplate);
  }

  return params.reduce((collector: T, param) => {
    /* Execute the regex indicated by the 'match' parameter */
    const paramValResult = new RegExp(param.match + '([^\\/?]+)').exec(pathString);

    /* Set the according value in the collector object. */
    collector[param.paramName] = paramValResult && paramValResult.length ?
      paramValResult[paramValResult.length - 1] : null;

    return collector;
  }, {} as T)
};
