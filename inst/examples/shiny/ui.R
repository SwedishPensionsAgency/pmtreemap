library(shiny)
library(widgets)

shinyUI(fluidPage(
  
  singleton(
    tags$head(
      tags$script(src = "htmlwidgets/pmtreemapMod.js"),
      tags$link(rel = "stylesheet", type = "text/css", href = "htmlwidgets/pmtreemap.css")
    )
  ),
  
  titlePanel("Shiny treemapD3"),
  
  sidebarLayout(
    sidebarPanel(
      numericInput("opacity", "Opacity", 0.6, min = 0.1, max = 1, step = .1)
    ),
    mainPanel(
      tabsetPanel(
        tabPanel("D3 Treemap", treemapOutput("tree"))
      )
    )
  )
))