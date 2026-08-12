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
import com.example.everythingapp.models.VedaItem
import kotlinx.coroutines.delay

@Composable
fun MusicVedasScreen(
    vedas: List<VedaItem>
) {
    var isPracticing by remember { mutableStateOf(false) }
    var practiceSecs by remember { mutableStateOf(0) }

    LaunchedEffect(isPracticing) {
        while (isPracticing) {
            delay(1000L)
            practiceSecs += 1
        }
    }

    val mins = practiceSecs / 60
    val secs = practiceSecs % 60
    val timeStr = String.format("%02d:%02d", mins, secs)

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
                    text = "🎵 MUSIC & VEDAS STUDIO",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF8B5CF6)
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Carnatic Abhyasa & Veda Memorizer",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        }

        // Abhyasa Timer Card
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF8B5CF6).copy(alpha = 0.15f)),
            modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
        ) {
            Column(
                modifier = Modifier.padding(20.dp).fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("CARNATIC ABHYASA SESSION", color = Color(0xFF8B5CF6), fontWeight = FontWeight.Bold, fontSize = 12.sp)
                Text(timeStr, color = Color(0xFF8B5CF6), fontWeight = FontWeight.ExtraBold, fontSize = 38.sp)

                Spacer(modifier = Modifier.height(8.dp))
                Button(
                    onClick = { isPracticing = !isPracticing },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isPracticing) Color(0xFFF43F5E) else Color(0xFF8B5CF6)
                    )
                ) {
                    Text(if (isPracticing) "Pause Abhyasa" else "Start Practice Session", color = Color.White)
                }
            }
        }

        // Vedas List
        Text("Veda Sukta Memorizer:", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
        Spacer(modifier = Modifier.height(8.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(vedas) { veda ->
                val pct = (veda.memorizedVerses.toFloat() / veda.totalVerses * 100).toInt()
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF131C2E)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(veda.name, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                            Text("$pct%", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF10B981))
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            "Memorized: ${veda.memorizedVerses} / ${veda.totalVerses} Verses",
                            fontSize = 12.sp,
                            color = Color(0xFF94A3B8)
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        LinearProgressIndicator(
                            progress = veda.memorizedVerses.toFloat() / veda.totalVerses,
                            modifier = Modifier.fillMaxWidth(),
                            color = Color(0xFF10B981),
                            trackColor = Color(0xFF1E293B)
                        )
                    }
                }
            }
        }
    }
}
