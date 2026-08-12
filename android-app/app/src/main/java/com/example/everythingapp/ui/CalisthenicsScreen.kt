package com.example.everythingapp.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.everythingapp.models.CalisthenicsProgression
import kotlinx.coroutines.delay

@Composable
fun CalisthenicsScreen(
    progressions: List<CalisthenicsProgression>
) {
    var activeExercise by remember { mutableStateOf<CalisthenicsProgression?>(null) }
    var restSecondsLeft by remember { mutableStateOf(60) }
    var isResting by remember { mutableStateOf(false) }

    // Rest countdown effect
    LaunchedEffect(isResting, restSecondsLeft) {
        if (isResting && restSecondsLeft > 0) {
            delay(1000L)
            restSecondsLeft -= 1
            if (restSecondsLeft == 0) {
                isResting = false
            }
        }
    }

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
                    text = "💪 LEAN ATHLETIC PHYSIQUE",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF06B6D4)
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Calisthenics Progressions & Timers",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "Master bodyweight relative strength without bulky mass.",
                    fontSize = 13.sp,
                    color = Color(0xFF94A3B8)
                )
            }
        }

        // Active Rest Timer Alert Card
        if (isResting) {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF06B6D4).copy(alpha = 0.2f)),
                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp).fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("REST & RECOVER", color = Color(0xFF06B6D4), fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    Text("$restSecondsLeft s", color = Color(0xFF06B6D4), fontWeight = FontWeight.ExtraBold, fontSize = 42.sp)
                    Text("Shake out arms & breathe deeply into belly", color = Color.White, fontSize = 12.sp)
                }
            }
        }

        // List of Calisthenics Progressions
        LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(progressions) { ex ->
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
                            Text(ex.name, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = Color(0xFFF59E0B).copy(alpha = 0.2f)
                            ) {
                                Text(
                                    ex.category.uppercase(),
                                    color = Color(0xFFF59E0B),
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "${ex.recommendedSets} Sets × ${ex.recommendedReps} • ${ex.restSeconds}s Rest",
                            fontSize = 13.sp,
                            color = Color(0xFF06B6D4)
                        )

                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Form Cues:", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF94A3B8))
                        ex.keyCues.forEach { cue ->
                            Text("• $cue", fontSize = 12.sp, color = Color(0xFFCBD5E1))
                        }

                        Spacer(modifier = Modifier.height(10.dp))
                        Button(
                            onClick = {
                                activeExercise = ex
                                restSecondsLeft = ex.restSeconds
                                isResting = true
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF06B6D4)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Start Set & 60s Rest Timer", color = Color(0xFF090D16), fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
