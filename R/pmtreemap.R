#' <Add Title>
#'
#' <Add Description>
#'
#' @import htmlwidgets
#'
#' @export
treemap <- function(data, width = NULL, height = NULL) {
  print(paste("treemap, ", "width = ",width))
  #print(paste("treemap, message: ", toString(message)))
  
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
    #htmlwidgets::sizingPolicy(padding = 0, browser.fill = TRUE), # Tillagd
    package = 'pmwidgets'
  )
}

#' Widget output function for use in Shiny
#'
#' @export
treemapOutput <- function(outputId, width = '600px', height = '600px'){
#treemapOutput <- function(outputId, width, height){
  print(paste("treemapOutput, ","width = ",width))
  shinyWidgetOutput(outputId, 'pmtreemap', width = width, height = height, package = 'pmwidgets')
  #shinyWidgetOutput(outputId, 'treemap', width, height)
}

#' Widget render function for use in Shiny
#'
#' @export
renderTreemap <- function(expr, env = parent.frame(), quoted = FALSE) {
  print("renderTreemap")
  if (!quoted) { expr <- substitute(expr) } # force quoted
  shinyRenderWidget(expr, treemapOutput, env, quoted = TRUE)
}
