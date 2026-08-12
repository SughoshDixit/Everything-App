package com.example.everythingapp.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.everythingapp.models.*

@Composable
fun EverythingAppRoot() {
    var selectedTab by remember { mutableStateOf(0) }
    var selectedPersona by remember { mutableStateOf("sughosh") }

    // Mock initial data
    val scheduleItems = remember {
        mutableStateListOf(
            ScheduleItem("s1", "Morning Veda Chanting", "06:30 AM", 6, 30, 20, "morning", "sughosh"),
            ScheduleItem("s2", "Beginner Calisthenics Routine", "07:30 AM", 7, 30, 45, "fitness", "sughosh"),
            ScheduleItem("s3", "Carnatic Vocal Abhyasa", "06:00 PM", 18, 0, 45, "music_veda", "sughosh"),
            ScheduleItem("s4", "Forward Winger Agility & Finishing", "07:30 PM", 19, 30, 40, "fitness", "sughosh"),
            ScheduleItem("s5", "Evening Recovery Stretch", "10:00 PM", 22, 0, 15, "evening", "both")
        )
    }

    val calisthenicsProgressions = remember {
        listOf(
            CalisthenicsProgression("c1", "Knee / Incline Push-Ups", "push", 3, "8-12 reps", 60, listOf("Tuck elbows 45°", "Squeeze core", "Chest to floor")),
            CalisthenicsProgression("c2", "Standard Bodyweight Push-Ups", "push", 3, "6-10 reps", 60, listOf("Straight plank line", "Full depth")),
            CalisthenicsProgression("c3", "Inverted Door/Table Rows", "pull", 3, "8-12 reps", 60, listOf("Pull chest to hands", "Squeeze lats")),
            CalisthenicsProgression("c4", "Air Squats & Reverse Lunges", "legs", 3, "12-15 reps", 60, listOf("Drive through heels", "Knees inline")),
            CalisthenicsProgression("c5", "Bench Chair Dips", "dip", 3, "8-12 reps", 60, listOf("Elbows to 90°", "Press up firmly")),
            CalisthenicsProgression("c6", "Hollow Body Hold", "core", 3, "30-45 sec hold", 45, listOf("Lower back flat", "Point toes"))
        )
    }

    val footballDrills = remember {
        listOf(
            FootballDrillItem("f1", "5-10-5 Pro Agility Shuttle", "agility", "HIGH", 15, "Line of 3 cones (5 yards apart)", listOf("Start at center cone", "Explode right 5yd, touch line", "Turn and sprint left 10yd, touch line", "Burst back through center")),
            FootballDrillItem("f2", "Explosive 15m Acceleration Bursts", "acceleration", "EXTREME", 20, "Start line + 15m finish marker", listOf("Perform 6 max effort sprints", "90s full walk-back recovery")),
            FootballDrillItem("f3", "Touchline Cut-Inside Finishing", "finishing", "HIGH", 25, "Flank dribble line + goal target", listOf("Dribble at high speed", "Execute chop stepover cut inside", "Curl shot far corner"))
        )
    }

    val vedaItems = remember {
        listOf(
            VedaItem("v1", "Purusha Suktam", 24, 16),
            VedaItem("v2", "Shri Suktam", 15, 10),
            VedaItem("v3", "Vishnu Suktam", 12, 8)
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                currentPersona = selectedPersona,
                onSelectPersona = { selectedPersona = it }
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = Color(0xFF131C2E)
            ) {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    label = { Text("Night Planner") },
                    icon = { Text("🌙") }
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    label = { Text("Calisthenics") },
                    icon = { Text("💪") }
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    label = { Text("Football") },
                    icon = { Text("⚽") }
                )
                NavigationBarItem(
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 },
                    label = { Text("Music/Vedas") },
                    icon = { Text("🎵") }
                )
            }
        },
        containerColor = Color(0xFF090D16)
    ) { padding ->
        Box(modifier = Modifier.padding(padding)) {
            when (selectedTab) {
                0 -> NightBeforePlannerScreen(
                    scheduleItems = scheduleItems,
                    onAddScheduleItem = { scheduleItems.add(it) }
                )
                1 -> CalisthenicsScreen(progressions = calisthenicsProgressions)
                2 -> FootballWingerScreen(drills = footballDrills)
                3 -> MusicVedasScreen(vedas = vedaItems)
            }
        }
    }
}

@Composable
fun TopAppBar(
    currentPersona: String,
    onSelectPersona: (String) -> Unit
) {
    Surface(
        color = Color(0xFF131C2E),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(14.dp).fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("EVERYTHING APP", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Text("sughoshkishreya.space", fontSize = 11.sp, color = Color(0xFF06B6D4))
            }

            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                FilterChip(
                    selected = currentPersona == "sughosh",
                    onClick = { onSelectPersona("sughosh") },
                    label = { Text("Sughosh", fontSize = 12.sp) }
                )
                FilterChip(
                    selected = currentPersona == "shreya",
                    onClick = { onSelectPersona("shreya") },
                    label = { Text("Shreya", fontSize = 12.sp) }
                )
            }
        }
    }
}
