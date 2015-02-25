library("ggplot2")
library("jsonlite")
library("dplyr")

base_data <- diamonds[sample(1:nrow(diamonds), 53940),]
#base_data <- diamonds[sample(1:nrow(diamonds), 100),]

## Gruppera data
gglist <- base_data %>% 
  tbl_df() %>% 
  group_by(cut, color, clarity, table) %>% 
  summarise(n_g1 = length(x)) %>% 
  mutate(n_g2 = sum(n_g1)) %>% 
  group_by(cut, color) %>% 
  mutate(n_g3 = sum(n_g1)) %>% 
  group_by(cut) %>% 
  mutate(n_g4 = sum(n_g1)) %>%
  ungroup() %>% 
  mutate(n_total = sum(n_g1))

## Skapa datalista
size = unbox(gglist$n_total[[1]])
label = unbox("Total")
name = unbox("Total")

datalist <- list(size = size, name = name, label = label, children = list())
for (i in unique(gglist$cut)) {
  data_1 <- gglist %>% filter(cut == i)
  
  size = unbox(data_1$n_g4[[1]])
  label = unbox(as.character(unique(data_1$cut)[[1]]))
  name = unbox((data_1 %>% mutate(name = paste(cut, sep="_")))$name[[1]])
  
  newNode_1 <- list(size = size, name = name, label = label, children = list())
  for (j in unique(data_1$color)) {
    data_2 <- data_1 %>% filter(color == j)
    
    size = unbox(data_2$n_g3[[1]])
    label = unbox(as.character(unique(data_2$color)[[1]]))
    name = unbox((data_2 %>% mutate(name = paste(cut,color, sep="_")))$name[[1]])
    
    newNode_2 <- list(size = size, name = name, label = label, children = list())
    for (k in unique(data_2$clarity)) {
      data_3 <- data_2 %>% filter(clarity == k)
      
      size = unbox(data_3$n_g2[[1]])
      label = unbox(as.character(unique(data_3$clarity)[[1]]))
      name = unbox((data_3 %>% mutate(name = paste(cut,color,clarity, sep="_")))$name[[1]])
      
      newNode_3 <- list(size = size, name = name, label = label, children = list())
      for (l in unique(data_3$table)) {
        data_4 <- data_3 %>% filter(table == l)
        
        size = unbox(data_4$n_g1[[1]])
        label = unbox(as.character(unique(data_4$table)[[1]]))
        name = unbox((data_4 %>% mutate(name = paste(cut,color,clarity,table, sep="_")))$name[[1]])
        
        newNode_4 <- list(size = size, name = name, label = label, children = list())
        newNode_3[['children']] <- append(newNode_3[['children']], list(newNode_4))
        
      }
      newNode_2[['children']] <- append(newNode_2[['children']], list(newNode_3))
      
    }
    newNode_1[['children']] <- append(newNode_1[['children']], list(newNode_2))
  }
  
  datalist[['children']] <- append(datalist[['children']], list(newNode_1))
}


dataJSON <- toJSON(datalist, pretty = TRUE)
# cat(dataJSON, file = "gglist.json")
