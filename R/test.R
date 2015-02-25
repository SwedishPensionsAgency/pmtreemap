# library(ggplot2)
# library(jsonlite)
# library(dplyr)
# 
# gglist <- diamonds %>%
#   tbl_df() %>%
#   group_by(cut, color, clarity, table) %>%
#   summarise(n = length(x))
# 
# datalist <- list(name = "Total", children = list())
# for (CUT in unique(gglist$cut)) {
#   for (COLOR in unique(gglist[gglist$cut == CUT,]$color)) {
#     for (CLARITY in unique(gglist[gglist$cut == CUT & gglist$color == COLOR,]$clarity)) {
#       children = list()
#       for (TABLE in unique(gglist[gglist$cut == CUT & gglist$color == COLOR & gglist$clarity == CLARITY,]$table)) {
#         data <- gglist[gglist$cut == CUT & gglist$color == COLOR & gglist$clarity == CLARITY,]
#         node <- list(size = gglist$n, name = gglist$clarity)
#         children[length(children)+1] = node
#         #print("loop");
#       }
#       print(toJSON(children))
#       
#     }
#   }
# }