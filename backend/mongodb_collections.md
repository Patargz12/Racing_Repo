I want to test if you are really capable of reading what I have inside of my MongoDB database, in my collection called " Results_GR_Cup_Race_01 " , I want you to tell me the position of number 55.

Analysis_Endurance_With_Sections
Sample Data:

{"\_id":{"$oid":"690f035133969aafabfef578"},"NUMBER":{"$numberInt":"3"}," DRIVER_NUMBER":{"$numberInt":"1"}," LAP_NUMBER":{"$numberInt":"1"}," LAP_TIME":"4:23.648"," LAP_IMPROVEMENT":{"$numberInt":"0"}," CROSSING_FINISH_LINE_IN_PIT":null," S1":"1:31.594"," S1_IMPROVEMENT":{"$numberInt":"0"}," S2":"1:26.697"," S2_IMPROVEMENT":{"$numberInt":"0"}," S3":"1:25.357"," S3_IMPROVEMENT":{"$numberInt":"0"}," KPH":{"$numberInt":"89"}," ELAPSED":"4:23.648"," HOUR":"14:31:08.857","S1_LARGE":"1:31.594","S2_LARGE":"1:26.697","S3_LARGE":"1:25.357","TOP_SPEED":{"$numberDouble":"168.2"},"PIT_TIME":"0:00:42.522","CLASS":"Am","GROUP":null,"MANUFACTURER":"Toyota Gazoo Racing","FLAG_AT_FL":"FCY","S1_SECONDS":{"$numberDouble":"91.594"},"S2_SECONDS":{"$numberDouble":"86.697"},"S3_SECONDS":{"$numberDouble":"85.357"},"IM1a_time":"1:01.261","IM1a_elapsed":"1:01.261","IM1_time":{"$numberDouble":"30.333"},"IM1_elapsed":"1:31.594","IM2a_time":{"$numberDouble":"40.751"},"IM2a_elapsed":"2:12.345","IM2_time":{"$numberDouble":"45.946"},"IM2_elapsed":"2:58.291","IM3a_time":{"$numberDouble":"48.364"},"IM3a_elapsed":"3:46.655","FL_time":{"$numberDouble":"36.993"},"FL_elapsed":"4:23.648","uploadedAt":{"$date":{"$numberLong":"1762591569583"}}}

Best_10_Laps_By_Driver_1
Sample Data:
{"\_id":{"$oid":"690f061033969aafabfef742"},"NUMBER":{"$numberInt":"2"},"VEHICLE":"Toyota GR86","CLASS":"Am","TOTAL_DRIVER_LAPS":{"$numberInt":"15"},"BESTLAP_1":"2:40.838","BESTLAP_1_LAPNUM":{"$numberInt":"14"},"BESTLAP_2":"2:43.063","BESTLAP_2_LAPNUM":{"$numberInt":"13"},"BESTLAP_3":"2:43.415","BESTLAP_3_LAPNUM":{"$numberInt":"12"},"BESTLAP_4":"2:43.782","BESTLAP_4_LAPNUM":{"$numberInt":"15"},"BESTLAP_5":"2:45.551","BESTLAP_5_LAPNUM":{"$numberInt":"11"},"BESTLAP_6":"2:45.619","BESTLAP_6_LAPNUM":{"$numberInt":"10"},"BESTLAP_7":"2:48.533","BESTLAP_7_LAPNUM":{"$numberInt":"5"},"BESTLAP_8":"2:49.117","BESTLAP_8_LAPNUM":{"$numberInt":"7"},"BESTLAP_9":"2:49.885","BESTLAP_9_LAPNUM":{"$numberInt":"4"},"BESTLAP_10":"2:52.515","BESTLAP_10_LAPNUM":{"$numberInt":"6"},"AVERAGE":"2:46.231","uploadedAt":{"$date":{"$numberLong":"1762592272798"}}}

Provisional_Results_Class_Race_01
Sample Data:
{"\_id":{"$oid":"690f022633969aafabfef524"},"CLASS_TYPE":"Am","POS":{"$numberInt":"1"},"PIC":{"$numberInt":"1"},"NUMBER":{"$numberInt":"55"},"VEHICLE":"Toyota GR86","LAPS":{"$numberInt":"15"},"ELAPSED":"45:03.689","GAP_FIRST":null,"GAP_PREVIOUS":null,"BEST_LAP_NUM":{"$numberInt":"14"},"BEST_LAP_TIME":"2:43.767","BEST_LAP_KPH":{"$numberDouble":"143.2"},"uploadedAt":{"$date":{"$numberLong":"1762591270835"}}}

Provisional*Results_Race_1
Sample Data:
{"\_id":{"$oid":"690f00f233969aafabfef4ec"},"POSITION":{"$numberInt":"1"},"NUMBER":{"$numberInt":"55"},"STATUS":"Classified","LAPS":{"$numberInt":"15"},"TOTAL_TIME":"45:03.689","GAP_FIRST":"-","GAP_PREVIOUS":"-","FL_LAPNUM":{"$numberInt":"14"},"FL_TIME":"2:43.767","FL_KPH":{"$numberDouble":"143.2"},"CLASS":"Am","GROUP":null,"DIVISION":"GR Cup","VEHICLE":"Toyota GR86","TIRES":null,"ECM Participant Id":null,"ECM Team Id":null,"ECM Category Id":null,"ECM Car Id":null,"ECM Brand Id":null,"ECM Country Id":null,"*Extra 7":null,"*Extra 8":null,"\*Extra 9":null,"Sort Key":null,"DRIVER**Extra 3":null,"DRIVER\_*Extra 4":null,"DRIVER\_\*Extra 5":null,"uploadedAt":{"$date":{"$numberLong":"1762590962587"}}}

Results_By_Class_GR_CUP_Race_01
Sample Data:
{"\_id":{"$oid":"690f031433969aafabfef55c"},"CLASS_TYPE":"Am","POS":{"$numberInt":"1"},"PIC":{"$numberInt":"1"},"NUMBER":{"$numberInt":"55"},"VEHICLE":"Toyota GR86","LAPS":{"$numberInt":"15"},"ELAPSED":"45:03.689","GAP_FIRST":null,"GAP_PREVIOUS":null,"BEST_LAP_NUM":{"$numberInt":"14"},"BEST_LAP_TIME":"2:43.767","BEST_LAP_KPH":{"$numberDouble":"143.2"},"uploadedAt":{"$date":{"$numberLong":"1762591508862"}}}

Results*GR_Cup_Race_01
Sample Data:
{"\_id":{"$oid":"690f01d633969aafabfef508"},"POSITION":{"$numberInt":"1"},"NUMBER":{"$numberInt":"55"},"STATUS":"Classified","LAPS":{"$numberInt":"15"},"TOTAL_TIME":"45:03.689","GAP_FIRST":"-","GAP_PREVIOUS":"-","FL_LAPNUM":{"$numberInt":"14"},"FL_TIME":"2:43.767","FL_KPH":{"$numberDouble":"143.2"},"CLASS":"Am","GROUP":null,"DIVISION":"GR Cup","VEHICLE":"Toyota GR86","TIRES":null,"ECM Participant Id":null,"ECM Team Id":null,"ECM Category Id":null,"ECM Car Id":null,"ECM Brand Id":null,"ECM Country Id":null,"*Extra 7":null,"*Extra 8":null,"\*Extra 9":null,"Sort Key":null,"DRIVER**Extra 3":null,"DRIVER\_*Extra 4":null,"DRIVER\_\*Extra 5":null,"uploadedAt":{"$date":{"$numberLong":"1762591190615"}}}

Weather_Race_1
Sample Data:
{"\_id":{"$oid":"690f036d33969aafabfef717"},"TIME_UTC_SECONDS":{"$numberInt":"1755372430"},"TIME_UTC_STR":"8/16/2025 7:27:10 PM","AIR_TEMP":{"$numberDouble":"20.91"},"TRACK_TEMP":{"$numberDouble":"23.7"},"HUMIDITY":{"$numberDouble":"94.47"},"PRESSURE":{"$numberDouble":"978.2"},"WIND_SPEED":{"$numberDouble":"3.24"},"WIND_DIRECTION":{"$numberInt":"334"},"RAIN":{"$numberInt":"0"},"uploadedAt":{"$date":{"$numberLong":"1762591597057"}}}

road_america_lap_end_R1
Sample Data:
{"\_id":{"$oid":"690f151233969aafabfef75e"},"expire_at":null,"lap":{"$numberInt":"32768"},"meta_event":"I_R05_2025-08-17","meta_session":"R1","meta_source":"kafka:gr-raw","meta_time":"2025-08-16T19:06:30.162Z","outing":{"$numberInt":"0"},"timestamp":"2025-08-16T19:06:25.629Z","value":"2025-08-16T19:06:25.629Z","vehicle_id":"GR86-062-012","uploadedAt":{"$date":{"$numberLong":"1762596113959"}}}

road_america_lap_start_R1
Sample Data:
{"\_id":{"$oid":"690f15cc33969aafabfef83b"},"expire_at":null,"lap":{"$numberInt":"1"},"meta_event":"I_R05_2025-08-17","meta_session":"R1","meta_source":"kafka:gr-raw","meta_time":"2025-08-16T19:15:56.091Z","outing":{"$numberInt":"0"},"timestamp":"2025-08-16T19:15:53.297Z","value":"2025-08-16T19:15:53.297Z","vehicle_id":"GR86-010-16","uploadedAt":{"$date":{"$numberLong":"1762596300219"}}}

road_america_lap_time_R1
Sample Data:
{"\_id":{"$oid":"690f15f033969aafabfef918"},"expire_at":null,"lap":{"$numberInt":"32768"},"meta_event":"I_R05_2025-08-17","meta_session":"R1","meta_source":"kafka:gr-raw","meta_time":"2025-08-16T19:16:11.729Z","outing":{"$numberInt":"0"},"timestamp":"2025-08-16T19:16:10.678Z","value":{"$numberInt":"1041902"},"vehicle_id":"GR86-022-13","uploadedAt":{"$date":{"$numberLong":"1762596336819"}}}
