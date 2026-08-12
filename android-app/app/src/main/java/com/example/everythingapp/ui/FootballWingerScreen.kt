package com.example.everythingapp.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.everythingapp.models.FootballDrillItem

@Composable
fun FootballWingerScreen(
    drills: List<FootballDrillItem>
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF090D16))
            .padding(16.dp)
    ) {
        // Banner
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF131C2E)),
            modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "⚽ FORWARD / WINGER CONDITIONING",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFFF43F5E)
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Explosive Speed & Agility Drills",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "1v1 isolation dribbling, pro agility shuttles, 15m acceleration bursts.",
                    fontSize = 13.sp,
                    color = Color(0xFF94A3B8)
                )
            }
        }

        // Drills List
        LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(drills) { drill ->
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF131C2E)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(drill.title, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = Color(0xFFF43F5E).copy(alpha = 0.2f)
                            ) {
                                Text(
                                    drill.intensity,
                                    color = Color(0xFFF43F5E),
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))
                        Text("Cone Layout: ${drill.coneSetup}", fontSize = 13.sp, color = Color(0xFFF59E0B))
                        Text("Duration: ${drill.durationMinutes} mins", fontSize = 12.sp, color = Color(0xFF94A3B8))

                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Step-by-Step Instructions:", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        drill.instructions.forEachIndexed { idx, step ->
                            Text("${idx + 1}. $step", fontSize = 12.sp, color = Color(0xFFCBD5E1))
                        }
                    }
                }
            }
        }
    }
}
