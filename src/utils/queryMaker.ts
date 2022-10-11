import { PipelineStage } from "mongoose"
export function categoryAggregator (quaterRef: string): PipelineStage | any {
    return [
            // search for quater ref using default index

            {
               $search: {
                index: 'quaterref',
                text: {
                  query: quaterRef,
                  path: 'quater.ref'
                }
               }
            },
            {
              $facet: {
                // studio
            "Studio": [
              {
                $match: {propertyType: 'Studio'},
              },
              {
                $count: "studio_count"
              }
              ],
              // apartment
              "Apartment": [
              {
                $match: {propertyType: 'Apartment'},
              },
              {
                $count: "apartment_count"
              }
              ],

              // room count
              "OneBedroom": [
              {
                $match: {bedroom: 'ONE'},
              },
              {
                $count: "onebedroom_count"
              }
              ],

              "TwoBedroom": [
              {
                $match: {bedroom: 'TWO'},
              },
              {
                $count: "twobedroom_count"
              }
              ],

              "ThreeBedroom": [
              {
                $match: {bedroom: 'THREE'},
              },
              {
                $count: "threebedroom_count"
              }
              ],

              "FourPlusBedroom": [
              {
                $match: {bedroom: 'FOURPLUS'},
              },
              {
                $count: "fourplusbedroom_count"
              }
              ],

              // house
              "House": [
              {
                $match: {propertyType: 'House'},
              },
              {
                $count: "house_count"
              }
              ],

              // villa
              "Villa": [
              {
                $match: {propertyType: 'Villa'},
              },
              {
                $count: "villa_count"
              }
              ],

              // Office
              "Office": [
                {
                  $match: {propertyType: 'Office'},
                },
                {
                  $count: "office_count"
                }
                ],

              // private room
              "PrivateRoom": [
              {
                $match: {propertyType: 'Private Room'},
              },
              {
                $count: "privateroom_count"
              }
              ],

              // property sizes

              "Size_30": [
                {
                  $match: {propertySize: {$gte: 30}},
                },
                {
                  $count: "size_30_count"
                }
                ],

                "Size_60": [
                {
                  $match: {propertySize: {$gte: 60}},
                },
                {
                  $count: "size_60_count"
                }
                ],

                "Size_90": [
                {
                  $match: {propertySize: {$gte: 90}},
                },
                {
                  $count: "size_90_count"
                }
                ],

                "Size_120": [
                {
                  $match: {propertySize: {$gte: 120}},
                },
                {
                  $count: "size_120_count"
                }
                ],

                // furnished state

                "FurnishedState": [
                {
                  $match: {furnishedState: 'Furnished'},
                },
                {
                  $count: "furnishedState_count"
                }
                ],

                "UnfurnishedState": [
                {
                  $match: {furnishedState: 'Unfurnished'},
                },
                {
                  $count: "unfurnishedState_count"
                }
                ],

                // for facilities

                "PrivateLivingRoom": [
                {
                  $match: {facilities: {$in : ['Private Living Room']}},
                },
                {
                  $count: "privatelivingroom_count"
                }
                ],

                "PrivateBathroom": [
                {
                  $match: {facilities: {$in : ['Private Bathroom']}},
                },
                {
                  $count: "privatebathroom_count"
                }
                ],

                "PrivateToilet": [
                {
                  $match: {facilities: {$in : ['Private Toilet']}},
                },
                {
                  $count: "privatetoilet_count"
                }
                ],

                "Parking": [
                {
                  $match: {facilities: {$in : ['Parking']}},
                },
                {
                  $count: "parking_count"
                }
                ],

                "Balcony": [
                {
                  $match: {facilities: {$in : ['Balcony']}},
                },
                {
                  $count: "balcony_count"
                }
                ],

                 "Garden": [
                {
                  $match: {facilities: {$in : ['Garden']}},
                },
                {
                  $count: "garden_count"
                }
                ],

                 "SecurityCam": [
                {
                  $match: {facilities: {$in : ['Security Cam']}},
                },
                {
                  $count: "securitycam_count"
                }
                ],

                "SecurityGuard": [
                {
                  $match: {facilities: {$in : ['Security Guard']}},
                },
                {
                  $count: "securityguard_count"
                }
                ],

                "Elevator": [
                {
                  $match: {facilities: {$in : ['Elevator']}},
                },
                {
                  $count: "elevator_count"
                }
                ],

                // Amenities

                "WiFi": [
                {
                  $match: {amenities: {$in : ['WiFi']}},
                },
                {
                  $count: "wifi_count"
                }
                ],

                "AirConditioner": [
                {
                  $match: {amenities: {$in : ['Air Conditioner']}},
                },
                {
                  $count: "airconditioner_count"
                }
                ],

                "Closet": [
                {
                  $match: {amenities: {$in : ['Closet']}},
                },
                {
                  $count: "closet_count"
                }
                ],

                "Staffing": [
                {
                  $match: {amenities: {$in : ['Staffing']}},
                },
                {
                  $count: "staffing_count"
                }
                ],

            // features

                "Bathtub": [
                {
                  $match: {features: {$in : ['Bathtub']}},
                },
                {
                  $count: "bathtub_count"
                }
                ],

                "Homebar": [
                {
                  $match: {features: {$in : ['Home Bar']}},
                },
                {
                  $count: "homebar_count"
                }
                ],

                "WaterReservoir": [
                {
                  $match: {features: {$in : ['Water Reservoir']}},
                },
                {
                  $count: "waterreservoir_count"
                }
                ]
              }
            }]
}


export function townAggregator () : PipelineStage | any  {
  return [
    {
      $facet:
      {
        "Douala": [
          {
            $match: {town: 'Douala'},
          },
          {
            $count: "douala_count"
          }
          ],

          "Yaounde": [
          {
            $match: {town: 'Yaounde'},
          },
          {
            $count: "yaounde_count"
          }
          ],

          "Buea": [
          {
            $match: {town: 'Buea'},
          },
          {
            $count: "buea_count"
          }
          ],

          "Bafoussam": [
          {
            $match: {town: 'bafoussam'},
          },
          {
            $count: "bafoussam_count"
          }
          ],

           "Bamenda": [
          {
            $match: {town: 'Bamenda'},
          },
          {
            $count: "bamenda_count"
          }
          ],

           "Limbe": [
          {
            $match: {town: 'Limbe'},
          },
          {
            $count: "limbe_count"
          }
          ],

           "Kribi": [
          {
            $match: {town: 'Kribi'},
          },
          {
            $count: "kribi_count"
          }
          ]
      }
    }
  ]
}
