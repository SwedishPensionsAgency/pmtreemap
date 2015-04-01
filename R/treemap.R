#' treemap
#'
#' htmlwidget wrapper function for D3 treemaps
#'
#' @import htmlwidgets
#'
#' @export
treemap <- function(data, width = NULL, height = NULL) {
  
  # forward options using x
  x = list(
    data = data,
    options = '{}'
  )

  # create widget
  htmlwidgets::createWidget(
    name = 'treemap',
    x = x,
    width = width,
    height = height,
    package = 'pmwidgets'
  )
}

#' Widget output function for use in Shiny
#'
#' @export
treemapOutput <- function(outputId, width = '600px', height = '600px'){
  shinyWidgetOutput(outputId, 'pmtreemap', width = width, height = height, package = 'pmtreemap')
}

#' Widget render function for use in Shiny
#'
#' @export
renderTreemap <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  shinyRenderWidget(expr, treemapOutput, env, quoted = TRUE)
}
