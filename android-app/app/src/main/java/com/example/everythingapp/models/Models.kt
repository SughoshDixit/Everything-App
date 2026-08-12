package com.example.everythingapp.models

data class ScheduleItem(
    val id: String,
    val title: String,
    val timeString: String,
    val hour: Int,
    val minute: Int,
    val durationMinutes: Int,
    val category: String, // morning, fitness, music_veda, evening
    val assignedTo: String, // sughosh, shreya, both
    var isAlarmSet: Boolean = true
)

data class CalisthenicsProgression(
    val id: String,
    val name: String,
    val category: String, // push, pull, dip, legs, core
    val recommendedSets: Int,
    val recommendedReps: String,
    val restSeconds: Int,
    val keyCues: List<String>
)

data class FootballDrillItem(
    val id: String,
    val title: String,
    val category: String, // agility, acceleration, finishing, stamina
    val intensity: String,
    val durationMinutes: Int,
    val coneSetup: String,
    val instructions: List<String>
)

data class VedaItem(
    val id: String,
    val name: String,
    val totalVerses: Int,
    val memorizedVerses: Int
)

data class QuoteItem(
    val id: String,
    val text: String,
    val author: String
)
