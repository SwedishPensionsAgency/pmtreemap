library(shiny)
library(widgets)
library(htmlwidgets)
library(ggplot2)
library(htmlwidgets)
data(diamonds)  


#data(MisLinks)
#data(MisNodes)

  dataJSON = '{
    "size": 10,
    "name": "Total",
    "isLeaf": false,
    "children": [
{
  "size": 14,
  "name": "NodeA",
  "isLeaf": false,
  "children": [
{
  "size": 2,
  "name": "NodeA1",
  "isLeaf": false,
  "children": [
  {
    "size": 1,
    "name": "NodeA11",
    "isLeaf": false,
    "children": []
  },
  {
    "size": 1,
    "name": "NodeA12",
    "isLeaf": false,
    "children": []
  }
]
},
{
  "size": 3,
  "name": "NodeA2",
  "isLeaf": false,
  "children": [
  {
    "size": 2,
    "name": "NodeA21",
    "isLeaf": false,
    "children": [
  {
    "size": 1,
    "name": "NodeA211",
    "isLeaf": false,
    "children": []
  },
  {
    "size": 1,
    "name": "NodeA212",
    "isLeaf": false,
    "children": []
  }
]
  },
  {
    "size": 1,
    "name": "NodeA22",
    "isLeaf": false,
    "children": []
  }
]
},
{
  "size": 4,
  "name": "NodeA3",
  "isLeaf": false,
  "children": [
  {
    "size": 2,
    "name": "NodeA31",
    "isLeaf": false,
    "children": []
  },
  {
    "size": 1,
    "name": "NodeA32",
    "isLeaf": false,
    "children": []
  },
  {
    "size": 1,
    "name": "NodeA33",
    "isLeaf": false,
    "children": []
  }
]
},
{
"size": 5,
"name": "NodeA4",
"isLeaf": false,
"children": [
  {
    "size": 2,
    "name": "NodeA41",
    "isLeaf": false,
    "children": []
  },
  {
    "size": 2,
    "name": "NodeA42",
    "isLeaf": false,
    "children": []
  },
  {
    "size": 1,
    "name": "NodeA43",
    "isLeaf": false,
    "children": []
  }
]
}]},
{
  "size": 6,
  "name": "NodeB",
  "children": [
{
  "size": 2,
  "name": "NodeB1",
  "isLeaf": false,
  "children": []
},
{
  "size": 2,
  "name": "NodeB2",
  "isLeaf": false,
  "children": []
},
{
  "size": 2,
  "name": "NodeB3",
  "isLeaf": false,
  "children": []
}
]
},
{
  "size": 5,
  "name": "NodeC",
  "children": [
{
  "size": 1,
  "name": "NodeC1",
  "isLeaf": false,
  "children": []
},
{
  "size": 4,
  "name": "NodeC2",
  "isLeaf": false,
  "children": []
}
]
},
{
  "size": 2,
  "name": "NodeD",
  "children": [
{
  "size": 1,
  "name": "NodeD1",
  "isLeaf": false,
  "children": []
},
{
  "size": 1,
  "name": "NodeD2",
  "isLeaf": false,
  "children": []
}
]
}
]
}'
    
#returnJson <- sprintf('{data": %s}'
returnJson <- sprintf('%s'
                      ,dataJSON)


shinyServer(function(input, output) {
  #print("shinyServer")
  

  addResourcePath('htmlwidgets', "C:/dev/stash/Packages/pmwidgets/inst/htmlwidgets")
  

  data <- returnJson
  print("shinyServer, calling treemap")  
  
  output$tree <- renderTreemap({
    treemap(data = data, width = "900px", height = "600px")
  })
  
  
})