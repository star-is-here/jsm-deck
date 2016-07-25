library(shiny)
library(leaflet)


#version 2: each tab has a separate slider for year
shinyUI(navbarPage("Population Undernourished, 1991-2015", id = "nav",

  tabPanel("World Map",
          div(class = "outer",

              tags$style(type = "text/css",
                         ".outer {position: fixed; top: 41 px; left: 0;
                         right: 0; bottom: 0; overflow: hidden; padding: 0}"),

              leafletOutput("worldmap", width = "100%", height = "1075px"),

              absolutePanel(id = "controls", class = "panel panel-default",
                            fixed = TRUE, draggable = TRUE, top = "auto",
                            left = 20, right = "auto", bottom = 60,
                            width = 330, height = "auto",

                            sliderInput("yearmap", "Choose a year:",
                                        min = 1991, max = 2015, value = 2015,
                                        animate = FALSE, sep = ""),
                            checkboxInput("sanitation", 
                                          "Population not using improved sanitation facilities (%)",
                                          value = TRUE)
              ),

              tags$div(id = "cite",
                       strong("Data source:"), tags$em("United Nations' MDG Indicators Database
                       (http://mdgs.un.org/unsd/mdg/Data.aspx).", "Please send questions and comments
                         to Giang Nguyen (giang.huong.nguyen92@gmail.com)")
              )
          )
  ),

  tabPanel("Histogram",
           plotOutput("hist", width = "80%", height = "375px"),
           br(),
           hr(),
           br(),
           fluidRow(
             shiny::column(10, offset = 4,
                           sliderInput("yearhist", "Choose a year:",
                                       min = 1991, max = 2015, value = 2015,
                                       animate = TRUE, sep = "")
             )
           )
  )
))

### Old version: 2 tabs share 1 slider
# shinyUI(fluidPage(
#   
#   titlePanel("Population Undernourished, 1991-2015"),
#   
#   tabsetPanel(
#     tabPanel("World Map", 
#              leafletOutput("worldmap", width = "100%", height = "475px")
#     ),
#     tabPanel("Histogram",
#              plotOutput("hist", width = "80%", height = "375px")
#     )
#   ),
#   
#   hr(),
#   
#   fluidRow(
#     shiny::column(10, offset = 4,
#                   sliderInput("year", "Choose a year:",
#                               min = 1991, max = 2015, value = 2015,
#                               animate = TRUE, sep = "")  
#     )
#   ),
#   br(),
#   br(),
#   br(),
#   br(),
#   br(),
#   p(strong("Created by:"), "Giang Nguyen 
#     (giang.huong.nguyen92@gmail.com)"),
#   p(strong("Data source:"), "United Nations' MDG Indicators Database 
#     (http://mdgs.un.org/unsd/mdg/Data.aspx)")
#   ))