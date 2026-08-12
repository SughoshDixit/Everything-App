package com.example.everythingapp.ui

import android.content.Context
import android.widget.Toast
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.everythingapp.AlarmScheduler
import com.example.everythingapp.models.ScheduleItem

@Composable
fun NightBeforePlannerScreen(
    scheduleItems: List<ScheduleItem>,
    onAddScheduleItem: (ScheduleItem) -> Unit
) {
    val context = LocalContext.current
    var showAddDialog by remember { mutableStateOf(false) }

    var newTitle by remember { mutableStateOf("") }
    var newTimeStr by remember { mutableStateOf("07:30 AM") }
    var newHour by remember { mutableStateOf(7) }
    var newMin by remember { mutableStateOf(30) }

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
                    text = "🌙 NIGHT-BEFORE ROUTINE PLANNER",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF06B6D4)
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Stitch Tomorrow's Master Schedule",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Decide your exact schedule tonight. Tap 'Lock In & Set System Reminders' to program exact lock-screen system alarms for tomorrow.",
                    fontSize = 13.sp,
                    color = Color(0xFF94A3B8)
                )
            }
        }

        // Action Buttons Row
        Row(
            modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Button(
                onClick = { showAddDialog = true },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B))
            ) {
                Text("+ Add Routine Block", color = Color(0xFF06B6D4))
            }

            Button(
                onClick = {
                    val scheduler = AlarmScheduler(context)
                    scheduleItems.forEachIndexed { idx, item ->
                        scheduler.scheduleExactAlarm(
                            requestCode = 100 + idx,
                            hour = item.hour,
                            minute = item.minute,
                            title = item.title,
                            message = "Time for your scheduled ${item.durationMinutes} min ${item.category} session!"
                        )
                    }
                    Toast.makeText(
                        context,
                        "⏰ System Alarms Programmed for Tomorrow!",
                        Toast.LENGTH_LONG
                    ).show()
                },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF06B6D4))
            ) {
                Text("🔒 Lock In System Alarms", color = Color(0xFF090D16), fontWeight = FontWeight.Bold)
            }
        }

        // List of Timetable Items
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.weight(1f)
        ) {
            items(scheduleItems) { item ->
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF131C2E)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp).fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = item.timeString,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFF59E0B)
                            )
                            Text(
                                text = item.title,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color.White
                            )
                            Text(
                                text = "${item.durationMinutes} mins • Assigned: ${item.assignedTo.uppercase()}",
                                fontSize = 12.sp,
                                color = Color(0xFF64748B)
                            )
                        }

                        Surface(
                            shape = RoundedCornerShape(20.dp),
                            color = Color(0xFF10B981).copy(alpha = 0.2f),
                            modifier = Modifier.padding(start = 8.dp)
                        ) {
                            Text(
                                text = "⏰ ALARM SET",
                                color = Color(0xFF10B981),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                            )
                        }
                    }
                }
            }
        }
    }

    // Add Dialog Modal
    if (showAddDialog) {
        AlertDialog(
            onDismissRequest = { showAddDialog = false },
            title = { Text("Add Schedule Block", color = Color.White) },
            text = {
                Column {
                    OutlinedTextField(
                        value = newTitle,
                        onValueChange = { newTitle = it },
                        label = { Text("Routine Title") }
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = newTimeStr,
                        onValueChange = { newTimeStr = it },
                        label = { Text("Time (e.g. 07:30 AM)") }
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newTitle.isNotBlank()) {
                            onAddScheduleItem(
                                ScheduleItem(
                                    id = "s_" + System.currentTimeMillis(),
                                    title = newTitle,
                                    timeString = newTimeStr,
                                    hour = newHour,
                                    minute = newMin,
                                    durationMinutes = 30,
                                    category = "fitness",
                                    assignedTo = "sughosh"
                                )
                            )
                            newTitle = ""
                            showAddDialog = false
                        }
                    }
                ) {
                    Text("Save Block")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddDialog = false }) {
                    Text("Cancel")
                }
            },
            containerColor = Color(0xFF131C2E)
        )
    }
}
